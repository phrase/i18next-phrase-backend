import { PhraseApi, PhraseResponse } from './phrase_api';
import { PhraseStorage } from './storage/types';
import { defaultStorage } from './storage/default_storage';
import { version } from '../package.json';

export const PHRASE_SDK_VERSION = version;
const DEFAULT_FORMAT = 'i18next';
const DEFAULT_CACHE_EXPIRATION = 60 * 5;

export enum Datacenter {
  EU = 'https://ota.eu.phrase.com',
  US = 'https://ota.us.phrase.com',
}

export interface Options {
  distribution: string;
  environment: string;
  appVersion?: string;
  cacheExpirationTime?: number;
  datacenter?: Datacenter;
  host?: string;
  debug?: boolean;
  onError?: (error: Error, localeCode: string) => void;
  format?: 'i18next' | 'i18next_4';
  storage?: PhraseStorage;
}

export default class Phrase {
  private readonly options: Options;
  private readonly api: PhraseApi;
  private readonly storage: PhraseStorage;
  private uuidPromise: Promise<string> | null = null;

  constructor(options: Options) {
    this.options = { ...options, cacheExpirationTime: options.cacheExpirationTime ?? DEFAULT_CACHE_EXPIRATION };
    this.api = new PhraseApi({
      baseUrl: options.host ?? options.datacenter ?? Datacenter.EU,
      distribution: options.distribution,
      environment: options.environment,
      fileFormat: options.format ?? DEFAULT_FORMAT,
      sdkVersion: PHRASE_SDK_VERSION,
      appVersion: options.appVersion,
    });
    this.storage = options.storage ?? defaultStorage();
  }

  private log(s: string) {
    if (this.options.debug) {
      console.log('PHRASE: ' + s);
    }
  }

  private getUUID(): Promise<string> {
    if (!this.uuidPromise) {
      this.uuidPromise = this.loadOrGenerateUUID().catch((e) => {
        this.uuidPromise = null;
        throw e;
      });
    }
    return this.uuidPromise;
  }

  private async loadOrGenerateUUID(): Promise<string> {
    let uuid = await this.storage.getItem('UUID');
    if (!uuid) {
      uuid = crypto.randomUUID();
      await this.storage.setItem('UUID', uuid);
    }
    return uuid;
  }

  private reportError(localeCode: string, e: unknown) {
    this.log('OTA update for `' + localeCode + '`: ERROR: ' + e);
    try {
      this.options.onError?.(e instanceof Error ? e : new Error(String(e)), localeCode);
    } catch (callbackError) {
      this.log('onError callback threw: ' + callbackError);
    }
  }

  async requestTranslations(localeCode: string): Promise<Record<string, unknown>> {
    const uuid = await this.getUUID();
    const cacheKey = this.generateCacheKey(this.options.distribution, this.options.environment, localeCode);
    const expirationKey = `${cacheKey}::expiration`;
    const expirationDate = await this.storage.getItem(expirationKey);
    let cachedBody = await this.storage.getItem(cacheKey);

    // An expiration key without a body (evicted storage) must not suppress the fetch.
    if (!cachedBody || !expirationDate || Date.now() > parseInt(expirationDate)) {
      const [currentVersion, lastUpdate] = await Promise.all([
        this.storage.getItem(`${cacheKey}::current_version`),
        this.storage.getItem(`${cacheKey}::last_update`),
      ]);

      try {
        const response = await this.api.getTranslations({ locale: localeCode, uuid, currentVersion, lastUpdate });

        if (response != null) {
          this.log('OTA update for `' + localeCode + '`: OK');
          await this.cacheResponse(cacheKey, response);
          cachedBody = response.body;
        } else {
          this.log('OTA update for `' + localeCode + '`: NOT MODIFIED');
        }

        // Only set expiry when there is a body to serve — a 304 on a cold cache must not block retries.
        if (cachedBody) {
          const expiryTime = 1000 * this.options.cacheExpirationTime!;
          await this.storage.setItem(expirationKey, (Date.now() + expiryTime).toString());
        }
      } catch (e) {
        this.reportError(localeCode, e);
        // Serve the stale body if there is one; the expiration is left untouched so the next read retries.
        if (!cachedBody) {
          throw e;
        }
      }
    }

    if (cachedBody) {
      return JSON.parse(cachedBody);
    } else {
      this.log('Nothing found in cache, no translations returned');
      return {};
    }
  }

  async clearCache() {
    this.uuidPromise = null;
    await this.storage.clear();
  }

  private async cacheResponse(cacheKey: string, response: PhraseResponse) {
    await Promise.all([
      this.storage.setItem(cacheKey, response.body),
      this.storage.setItem(`${cacheKey}::last_update`, Date.now().toString()),
      this.storage.setItem(`${cacheKey}::current_version`, response.version?.toString() || ''),
    ]);
  }

  private generateCacheKey(distribution: string, environment: string, localeCode: string): string {
    return `${distribution}::${environment}::${localeCode}`;
  }
}
