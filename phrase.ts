import PhraseApi from "./phrase_api";

// const PHRASE_SDK_VERSION = require('./package.json').version
const PHRASE_SDK_VERSION = '1.0.0'
const DEFAULT_FORMAT = 'i18next'
const DEFAULT_URL = 'https://ota.phraseapp.com'
const CURRENT_VERSION = '0' // temporarily

export default class Phrase {
    distribution: string;
    secret: string;
    appVersion: string;
    fileFormat: string;
    uuid: string;
    api: PhraseApi;
    constructor(distribution: string, secret: string, appVersion: string, uuid: string,  fileFormat = DEFAULT_FORMAT, host = DEFAULT_URL) {
        this.distribution = distribution;
        this.secret = secret;
        this.appVersion = appVersion;
        this.fileFormat = fileFormat;
        this.uuid = uuid;

        this.api = new PhraseApi(host);
    }

    static log(s: string) {
        console.log("PHRASE: " + s);
    }

    async requestTranslation(localeCode: string) {
        // let localeHash = Phrase.localeHash(this.distribution, this.secret, localeCode)
        try {
            const response = await this.api.getTranslations(
                this.distribution,
                this.secret,
                localeCode,
                this.fileFormat,
                this.uuid,
                PHRASE_SDK_VERSION,
                CURRENT_VERSION,
                this.appVersion,
            )
            if (response != null) {
                return response.json;
                // Phrase.log("OTA update for `" + localeCode + "`: OK");
                // await this.repo.setCache(localeHash, response.json);
                // await this.repo.setLastUpdate();
                // await this.repo.setVersion(localeHash, response.version)
            } else if (response == null) {
                Phrase.log("OTA update for `" + localeCode + "`: NOT MODIFIED");
            }
        } catch (e) {
            Phrase.log("OTA update for `" + localeCode + "`: ERROR: " + e);
        }
    }
}
