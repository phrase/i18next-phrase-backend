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
      environment: 'YOUR_ENVIRONMENT_SECRET',
      appVersion: '1.0.0',
    }
  });
```

### Options

The backend accepts several options:

* `distribution` (required): The ID of your Phrase Strings OTA distribution
* `environment` (required): The environment token of your Phrase Strings OTA distribution. Different tokens exist for `development` (i.e. beta) and `production` environments
* `appVersion`: You can prevent some OTA releases from being serverd to certain app versions by providing minimum and maximum app version in Phrase Strings
* `cacheExpirationTime`: See [Caching](#caching) below
* `host`: By default, this library uses EU instance of Phrase Strings, if you use US DC, set this to `https://ota.us.phrase.com`
* `format`: By default this library uses the i18next format, if you use i18next v4 (for the new pluralization resolution strategy), set this to `i18next_4`
* `storage`: Custom async storage implementation (see [React Native](#react-native) below)

## React Native

`@phrase/i18next-backend` works in React Native when you provide an async storage implementation via the `storage` option. No React Native dependency is bundled. The package accepts any `AsyncStorage`-compatible storage implementation.

```
npm install --save @phrase/i18next-backend @react-native-async-storage/async-storage
```

```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nextPhraseBackend } from '@phrase/i18next-backend';

i18n
  .use(I18nextPhraseBackend)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    backend: {
      distribution: 'DISTRIBUTION_ID',
      environment: 'YOUR_ENVIRONMENT_SECRET',
      storage: AsyncStorage,
    },
  });
```

Any storage that implements `getItem`, `setItem`, and `clear` returning Promises is accepted (e.g. [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv) with a small adapter).

### react-native-web

For codebases that target both React Native and web via `react-native-web`, no platform-specific wiring is needed — passing `AsyncStorage` works on both targets since `@react-native-async-storage/async-storage` ships a web implementation backed by `localStorage`. Alternatively, omit `storage` entirely and the package auto-detects `localStorage` on the web build.

## Caching

The library is caching translations and won't check for new translations for 5 minutes. This can be configured by setting the `cacheExpirationTime` option in the backend configuration for testing purposes. It's recommended to use at least 5 minutes in production.

```javascript
i18n
  .use(I18nextPhraseBackend)
  .init({
    fallbackLng: 'en',
    backend: {
      distribution: 'DISTRIBUTION_ID',
      environment: 'YOUR_ENVIRONMENT_SECRET',
      appVersion: '1.0.0',
      cacheExpirationTime: 60 * 5, // time in seconds
    }
  });
```
