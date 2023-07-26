import { PhraseApi, PhraseResponse } from "./phrase_api";
import Repository from "./repository";

// const PHRASE_SDK_VERSION = require('./package.json').version
const PHRASE_SDK_VERSION = '1.0.0'
const DEFAULT_FORMAT = 'i18next'
const DEFAULT_URL = 'https://ota.eu.phrase.com'

export default class Phrase {
    distribution: string;
    secret: string;
    appVersion: string;
    fileFormat: string;
    uuid: string;
    api: PhraseApi;

    private repo: Repository = new Repository();

    constructor(distribution: string, secret: string, appVersion: string, fileFormat = DEFAULT_FORMAT, host = DEFAULT_URL) {
        this.distribution = distribution;
        this.secret = secret;
        this.appVersion = appVersion;
        this.fileFormat = fileFormat;
        this.uuid = this.getUUID();

        this.api = new PhraseApi(host);
    }

    static log(s: string) {
        console.log("PHRASE: " + s);
    }

    async requestTranslations(localeCode: string) {
        const cacheKey = this.generateCacheKey(this.distribution, this.secret, localeCode);
        const expirationKey = `${cacheKey}::expiration`;
        const expirationDate = this.repo.getItem(expirationKey);
        if (expirationDate) {
            if (Date.now() < parseInt(expirationDate)) {
                const cacheValue = this.repo.getItem(cacheKey);
                if (cacheValue) {
                    return JSON.parse(cacheValue);
                }
            }
        }

        const currentVersion = this.repo.getItem(`${cacheKey}::current_version`);
        const lastUpdate = this.repo.getItem(`${cacheKey}::last_update`);

        try {
            const response = await this.api.getTranslations(
                this.distribution,
                this.secret,
                localeCode,
                this.fileFormat,
                this.uuid,
                PHRASE_SDK_VERSION,
                currentVersion,
                this.appVersion,
                lastUpdate
            )
            if (response != null) {
                this.cacheResponse(cacheKey, response);
                return response.json;
            } else {
                Phrase.log("OTA update for `" + localeCode + "`: NOT MODIFIED");
            }

            const expiryTime = 1000 * 60 * 5; // Expire in 5 minutes
            this.repo.setItem(`${cacheKey}::expiration`, (Date.now() + expiryTime).toString());
        } catch (e) {
            Phrase.log("OTA update for `" + localeCode + "`: ERROR: " + e);
        }
    }

    private cacheResponse(cacheKey: string, response: PhraseResponse) {
        this.repo.setItem(cacheKey, JSON.stringify(response.json));
        this.repo.setItem("last_update", Date.now().toString());
        this.repo.setItem(`${cacheKey}::current_version`, response.version?.toString() || "")
    }

    private generateCacheKey(distribution: string, secret: string, localeCode: string): string {
        return `i18next-phrase-backend::${distribution}::${secret}::${localeCode}`;
    }

    private getUUID() {
        const uuidKey = "i18next-phrase-backend::UUID"
        let uuid = null
        uuid = this.repo.getItem(uuidKey);
        if (!uuid) {
            uuid = crypto.randomUUID();
            this.repo.setItem(uuidKey, uuid);
        }
        return uuid;
    }
}
