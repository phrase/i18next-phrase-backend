import Phrase, { Options } from "./phrase";

export class I18nextPhraseBackend {
  options: Options;
  type: string
  phrase?: Phrase
  static type: string

  constructor(_services: any, _options: Options) {
    this.type = 'backend'
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

  read(language: string, _namespace: string) {
    if (this.phrase) {
      const translation = this.phrase.requestTranslations(language)
      return new Promise((resolve) => {
        resolve(translation)
      })
    }
  }
}

I18nextPhraseBackend.type = 'backend'
