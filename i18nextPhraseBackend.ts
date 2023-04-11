class Backend {
  services: any
  options: {}
  allOptions: {}
  type: string
  static type: string

  constructor(services: any, options = {}, allOptions = {}) {
    this.services = services
    this.options = options
    this.allOptions = allOptions
    this.type = 'backend'
    this.init(services, options, allOptions)
  }

  init(services: any, options: {}, allOptions: {}) {
    this.services = services;
    this.options = options;
    this.allOptions = allOptions;
  }

  read (language: string, namespace: string, callback: (arg0: null, arg1: any) => void) {
    callback(null, {
      "button": {
        "save": "save {{count}} change",
        "save_plural": "save {{count}} changes"
      }
    });
  }

}

Backend.type = 'backend'

export default Backend