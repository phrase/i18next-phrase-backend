# i18nextPhraseBackend - Phrase Strings backend for i18next

## Description

This small library implements an example [backend](https://www.i18next.com/overview/plugins-and-utils#backends) for [`i18next`](https://www.i18next.com/) which retrieves the translations from Phrase OTA releases. The distribution should be created for `i18next` platform.

## Usage

A demo project can be found at https://github.com/phrase/ota-web-demo

### Basic usage

```
npm install --save @phrase/i18next-backend
```

```javascript
import i18n from "i18next";
import { I18nextPhraseBackend } from "@phrase/i18next-backend";

i18n
  .use(I18nextPhraseBackend)
  .init({
    fallbackLng: 'en',
    backend: {
      distribution: 'DISTRIBUTION_ID',
      secret: 'YOUR_ENVIRONMENT_SECRET',
      appVersion: '1.0.0',
    }
  });
```

### Options

The backend accepts several options:

* `distribution` (required): The ID of your Phrase Strings OTA distribution
* `secret` (required): The secret token of your Phrase Strings OTA distribution. There are different secrets for `development` (i.e. beta) and `production` environments
* `appVersion`: You can prevent some OTA releases from being serverd to certain app versions by providing minimum and maximum app version in Phrase Strings
* `cacheExpirationTime`: See [Caching](#caching) below
* `host`: By default, this library uses EU instance of Phrase Strings, if you use US DC, set this to `https://ota.us.phrase.com`

## Caching

The library is caching translations and won't check for new translations for 5 minutes. This can be configured by setting the `cacheExpirationTime` option in the backend configuration for testing purposes. It's recommended to use at least 5 minutes in production.

```javascript
i18n
  .use(I18nextPhraseBackend)
  .init({
    fallbackLng: 'en',
    backend: {
      distribution: 'DISTRIBUTION_ID',
      secret: 'YOUR_ENVIRONMENT_SECRET',
      appVersion: '1.0.0',
      cacheExpirationTime: 60 * 5, // time in seconds
    }
  });
```
