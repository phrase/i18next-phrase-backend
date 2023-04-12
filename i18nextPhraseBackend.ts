import Phrase from "./phrase";

class Backend {
  services: any
  options: {
    distribution: string
    uuid: string
    secret: string
  }
  allOptions: {}
  type: string
  phrase: Phrase | null
  static type: string

  constructor(services: any, options = {distribution: '', secret: '', uuid: ''}, allOptions = {}) {
    this.type = 'backend'
    this.options = options
    this.allOptions = options
    this.phrase = null
    this.init(services, options, allOptions)
  }

  init(services: any, options: {distribution: string, secret: string, uuid: string}, allOptions: {}) {
    this.services = services;
    this.options = options;
    this.allOptions = allOptions;
    this.phrase = new Phrase(options.distribution, options.secret, '1.0.0', options.uuid)
  }

  read (language: string, _namespace: string) {
    if (this.phrase) {
      const translation = this.phrase.requestTranslation(language)
        return new Promise((resolve) => {
          resolve(translation)
        })
    }
  }
}

Backend.type = 'backend'

export default Backend
