import { PhraseApi, PhraseResponse } from "./phrase_api";
import Repository from "./repository";
import UUID from "./uuid";

export const PHRASE_SDK_VERSION = '1.1.0'
const DEFAULT_FORMAT = 'i18next'
const DEFAULT_URL = 'https://ota.eu.phrase.com'

export interface Options {
    distribution: string,
    secret: string,
    appVersion?: string,
    cacheExpirationTime: number,
    host?: string,
    debug?: boolean
}

export default class Phrase {
    options: Options;
    fileFormat: string;
    uuid: string;
    api: PhraseApi;

    private repo: Repository = new Repository();

    constructor(options: Options) {
        this.options = options
        this.fileFormat = DEFAULT_FORMAT;
        this.uuid = this.getUUID();

        this.api = new PhraseApi(this.options.host || DEFAULT_URL);
    }

    log(s: string) {
        if (this.options.debug) {
            console.log("PHRASE: " + s);
        }
    }

    async requestTranslations(localeCode: string) {
        const cacheKey = this.generateCacheKey(this.options.distribution, this.options.secret, localeCode);
        const expirationKey = `${cacheKey}::expiration`;
        const expirationDate = this.repo.getItem(expirationKey);
        if (!expirationDate || Date.now() > parseInt(expirationDate)) {
            const currentVersion = this.repo.getItem(`${cacheKey}::current_version`);
            const lastUpdate = this.repo.getItem(`${cacheKey}::last_update`);

            try {
                const response = await this.api.getTranslations(
                    this.options.distribution,
                    this.options.secret,
                    localeCode,
                    this.fileFormat,
                    this.uuid,
                    PHRASE_SDK_VERSION,
                    currentVersion,
                    this.options.appVersion,
                    lastUpdate
                )
                if (response != null) {
                    this.log("OTA update for `" + localeCode + "`: OK");
                    this.cacheResponse(cacheKey, response);
                } else {
                    this.log("OTA update for `" + localeCode + "`: NOT MODIFIED");
                }

                const expiryTime = 1000 * this.options.cacheExpirationTime;
                this.repo.setItem(`${cacheKey}::expiration`, (Date.now() + expiryTime).toString());
            } catch (e) {
                this.log("OTA update for `" + localeCode + "`: ERROR: " + e);
                return({});
            }
        }

        const cacheValue = this.repo.getItem(cacheKey);
        if (cacheValue) {
            return JSON.parse(cacheValue);
        } else {
            this.log("Nothing found in cache, no translations returned");
            return({});
        }
    }

    clearCache() {
        this.repo.clear();
    }

    private cacheResponse(cacheKey: string, response: PhraseResponse) {
        this.repo.setItem(cacheKey, response.body);
        this.repo.setItem("last_update", Date.now().toString());
        this.repo.setItem(`${cacheKey}::current_version`, response.version?.toString() || "")
    }

    private generateCacheKey(distribution: string, secret: string, localeCode: string): string {
        return `${distribution}::${secret}::${localeCode}`;
    }

    private getUUID() {
        const uuidKey = "UUID"
        let uuid = null
        uuid = this.repo.getItem(uuidKey);
        if (!uuid) {
            uuid = new UUID().value;
            this.repo.setItem(uuidKey, uuid);
        }
        return uuid;
    }
}
