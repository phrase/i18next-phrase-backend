import Phrase, { Options } from "./phrase";
import { BackendModule, ReadCallback } from "i18next";

export class I18nextPhraseBackend implements BackendModule<Options> {
  options: Options;
  static type: "backend";
  phrase?: Phrase
  type!: "backend";

  constructor(_services: any, _options: Options) {
    this.options = {} as Options;
  }

  init(_services: any, options: Options) {
    if (!options.distribution || !options.secret) {
      throw new Error('distribution and secret are required');
    }

    this.options = options
    this.options.cacheExpirationTime = this.options.cacheExpirationTime || 60 * 5
    this.phrase = new Phrase(options)
  }

  read(language: string, _namespace: string, callback: ReadCallback) {
    if (this.phrase) {
      this.phrase.requestTranslations(language).then((translations) => {
        callback(null, translations)
      }).catch((error) => {
        callback(error, null)
      })
    }
  }
}

I18nextPhraseBackend.type = 'backend'
