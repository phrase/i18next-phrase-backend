import Phrase from "./phrase";

class Backend {
  services: any
  options: {
    distribution: string
    secret: string
  }
  type: string
  phrase: Phrase | null
  static type: string

  constructor(services: any, options = {distribution: '', secret: ''}) {
    this.type = 'backend'
    this.options = options
    this.phrase = null
    this.init(services, options)
  }

  init(services: any, options: {distribution: string, secret: string}) {
    this.services = services;
    this.options = options;
    const uuid = 'MY_UUID'; // TODO: properly generate and store in local storage
    this.phrase = new Phrase(options.distribution, options.secret, '1.0.0', uuid)
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
