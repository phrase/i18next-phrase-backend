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

  constructor(services: any, options = {distribution: '', secret: '', appVersion: '1.0.0'}) {
    this.type = 'backend'
    this.options = options
    this.phrase = null
    this.init(services, options)
  }

  init(_services: any, options: {distribution: string, secret: string, appVersion: string}) {
    this.options = options
    const uuid = this.getUUID()
    this.phrase = new Phrase(options.distribution, options.secret, options.appVersion, uuid)
  }

  read (language: string, _namespace: string) {
    if (this.phrase) {
      const translation = this.phrase.requestTranslation(language)
        return new Promise((resolve) => {
          resolve(translation)
        })
    }
  }

  getUUID() {
    const STORAGE_KEY = "i18nextPhraseBackend.UUID"
    let uuid = null
    if (typeof(Storage) !== "undefined") {
      uuid = localStorage.getItem(STORAGE_KEY)
      if (!uuid) {
        uuid = crypto.randomUUID()
        localStorage.setItem(STORAGE_KEY, uuid)
      }
    } else {
      // Sorry! No Web Storage support..
      uuid = 'GENERIC_UUID'
    }
    return uuid
  }
}

I18nextPhraseBackend.type = 'backend'
