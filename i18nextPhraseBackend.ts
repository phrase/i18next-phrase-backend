import Phrase from "./phrase";

class Backend {
  services: any
  options: {}
  allOptions: {}
  type: string
  phrase: Phrase
  static type: string

  constructor(services: any, options = {}, allOptions = {}) {
    console.log('in the constructor')
    this.services = services
    this.options = options
    this.allOptions = allOptions
    this.type = 'backend'
    this.init(services, options, allOptions)

    this.phrase = new Phrase('test', 'dev', '1.0.0', 'MY_UUID')
  }

  init(services: any, options: {}, allOptions: {}) {
    console.log('in init')
    this.services = services;
    this.options = options;
    this.allOptions = allOptions;
  }

  read (language: string, namespace: string, callback: (arg0: null, arg1: any) => void) {
    const translation = this.phrase.requestTranslation(language)
    callback(null, translation);
  }
}

Backend.type = 'backend'

export default Backend
