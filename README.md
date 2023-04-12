# i18nextPhraseBackend - OTA for web PoC

## Description

This small library implements an example [backend](https://www.i18next.com/overview/plugins-and-utils#backends) for [`i18next`](https://www.i18next.com/) which retrieves the translations from Phrase OTA releases. The distribution should be created for "React Native" platform.

## Usage

### Basic usage

```javascript
i18next
  .use(i18nextPhraseBackend.default)
  .init({
    fallbackLng: 'en',
    backend: {
      distribution: 'DISTRIBUTION_ID',
      secret: 'YOUR_ENVIRONMENT_SECRET',
      appVersion: '1.0.0',
      uuid: 'UNIQUE_USER_UUID'
    }
  });
```

### Combining with LocalStorage

It is usually a good idea to [cache](https://www.i18next.com/how-to/caching) the translations in order to reduce the load to OTA servers, so you can chain Phrase backend with LocalStorage cache:

```javascript
i18next
  .use(i18nextChainedBackend)
  .init({
    fallbackLng: "en",
    backend: {
      backends: [
        i18nextLocalStorageBackend,
        i18nextPhraseBackend.default
      ],
      backendOptions: [{
        // options for local storage backend
        expirationTime: 5 * 60 * 1000 // 5 minutes
      }, {
        // options for phrase backend
        distribution: 'DISTRIBUTION_ID',
        secret: 'YOUR_ENVIRONMENT_SECRET',
        appVersion: '1.0.0',
        uuid: 'UNIQUE_USER_UUID'
      }]
    }
  })
```
