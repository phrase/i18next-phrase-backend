# Migration Guide

## Unreleased

### Breaking: fetch failures are no longer swallowed

Previously a failed fetch (network error, timeout, 5xx, other HTTP errors) resulted in `callback(null, {})`, so i18next treated it as an empty bundle. Now `read` calls `callback(error, null)` and i18next reports `failedLoading`. If a cached body exists it is served as a stale fallback instead. A 404 (locale not found) still yields an empty result without an error. If you relied on the empty bundle, handle load errors (e.g. `i18n.on('failedLoading', ...)`) or the new `onError` option. See [Error handling](README.md#error-handling).

## v1 → v2

### Breaking: `secret` option renamed to `environment`

```ts
// v1
backend: { distribution: '...', secret: '...' }

// v2
backend: { distribution: '...', environment: '...' }
```

### Breaking: `clearCache()` is now async

```ts
// v1
phrase.clearCache();

// v2
await phrase.clearCache();
```

### New: `storage` option

Pass any `AsyncStorage`-compatible implementation to use this package in React Native. When omitted, the existing behaviour is preserved: `localStorage` in browsers, in-memory fallback elsewhere.

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';

backend: {
  distribution: '...',
  environment: '...',
  storage: AsyncStorage,
}
```

See the [React Native section in the README](./README.md#react-native) for the full setup.

### New: `Datacenter` enum

```ts
import { Datacenter } from '@phrase/i18next-backend';

backend: {
  distribution: '...',
  environment: '...',
  datacenter: Datacenter.US, // or Datacenter.EU (default)
}
```

### New: `PhraseStorage` interface exported

```ts
import type { PhraseStorage } from '@phrase/i18next-backend';
```

### Other

`i18next >= 21` is now declared as a peer dependency. No behaviour change — this was always the supported range.
