import Phrase from "./phrase";

export class I18nextPhraseBackend {
  options: {
    distribution: string
    secret: string
    appVersion: string
  }
  type: string
  phrase: Phrase | null
  static type: string

  constructor(services: any, options = { distribution: '', secret: '', appVersion: '1.0.0' }) {
    this.type = 'backend'
    this.options = options
    this.phrase = null
    this.init(services, options)
  }

  init(_services: any, options: { distribution: string, secret: string, appVersion: string }) {
    this.options = options
    this.phrase = new Phrase(options.distribution, options.secret, options.appVersion)
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
