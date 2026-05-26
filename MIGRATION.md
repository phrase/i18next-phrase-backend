# Migration Guide

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

### New: `PhraseStorage` interface exported

```ts
import type { PhraseStorage } from '@phrase/i18next-backend';
```

### Other

`i18next >= 21` is now declared as a peer dependency. No behaviour change — this was always the supported range.
