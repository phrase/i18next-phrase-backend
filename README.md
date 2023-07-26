# i18nextPhraseBackend - Phrase Strings backend for i18next

## Description

This small library implements an example [backend](https://www.i18next.com/overview/plugins-and-utils#backends) for [`i18next`](https://www.i18next.com/) which retrieves the translations from Phrase OTA releases. The distribution should be created for `i18next` platform.

## Usage

A demo project can be found at https://github.com/phrase/react_ota_example

### Basic usage

```javascript
import i18n from "i18next";
import { I18nextPhraseBackend } from "i18next-phrase-backend";

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
