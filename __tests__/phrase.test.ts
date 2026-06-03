import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import Phrase, { PHRASE_SDK_VERSION, Datacenter, Options } from '../src/phrase';
import { FakeStorage } from './helpers/fake_storage';

const V4_UUID = 'b54f7566-6d85-4d97-9960-2ad82edfe317';
jest.spyOn(global.crypto, 'randomUUID').mockReturnValue(V4_UUID as ReturnType<typeof crypto.randomUUID>);

const mockResponse = { translations: { foo: 'bar' } };

function makeFetch(status: number): jest.Mock {
  return jest.fn(() =>
    Promise.resolve({
      status,
      ok: status >= 200 && status <= 399,
      url: 'https://example.com/foo',
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    }),
  ) as jest.Mock;
}

function setGlobalFetch(mock: jest.Mock) {
  global.fetch = mock as unknown as typeof fetch;
}

function makePhrase(overrides: Partial<Options> = {}) {
  return new Phrase({
    distribution: 'MY_DISTRIBUTION',
    environment: 'MY_SECRET',
    cacheExpirationTime: 1000,
    storage: new FakeStorage(),
    ...overrides,
  });
}

describe('requestTranslations', () => {
  describe('when the request is successful (200)', () => {
    let fetchMock: jest.Mock;
    let phrase: Phrase;

    beforeEach(async () => {
      phrase = makePhrase();
      fetchMock = makeFetch(200);
      setGlobalFetch(fetchMock);
    });

    test('returns translations', async () => {
      const translations = await phrase.requestTranslations('en');
      expect(translations).toEqual(mockResponse);
    });

    test('calls fetch exactly once', async () => {
      await phrase.requestTranslations('en');
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    test('two subsequent calls only fetch once (cache hit)', async () => {
      await phrase.requestTranslations('en');
      await phrase.requestTranslations('en');
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    test('request uses the correct URL and parameters', async () => {
      await phrase.requestTranslations('en');
      expect(fetchMock).toHaveBeenCalledWith(
        new URL(
          `https://ota.eu.phrase.com/MY_DISTRIBUTION/MY_SECRET/en/i18next?client=i18next&sdk_version=${PHRASE_SDK_VERSION}&unique_identifier=${V4_UUID}`,
        ),
        expect.anything(),
      );
    });
  });

  describe('when the server returns 304 (not modified)', () => {
    test('returns cached translations without re-fetching', async () => {
      const storage = new FakeStorage();
      const phrase = makePhrase({ storage });
      setGlobalFetch(makeFetch(200));
      await phrase.requestTranslations('en');

      const notModifiedFetch = makeFetch(304);
      setGlobalFetch(notModifiedFetch);

      storage.data.set('MY_DISTRIBUTION::MY_SECRET::en::expiration', '0');

      const result = await phrase.requestTranslations('en');
      expect(notModifiedFetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('when the request fails (4xx)', () => {
    test('returns an empty object', async () => {
      const phrase = makePhrase();
      setGlobalFetch(makeFetch(400));
      const translations = await phrase.requestTranslations('en');
      expect(translations).toEqual({});
    });
  });

  describe('UUID handling', () => {
    test('UUID is loaded from storage when already present', async () => {
      const storage = new FakeStorage();
      storage.data.set('UUID', 'stored-uuid');
      const phrase = new Phrase({
        distribution: 'D',
        environment: 'S',
        cacheExpirationTime: 60,
        storage,
      });
      setGlobalFetch(makeFetch(200));
      await phrase.requestTranslations('en');
      expect(storage.data.get('UUID')).toBe('stored-uuid');
    });

    test('UUID is generated and persisted when absent', async () => {
      const storage = new FakeStorage();
      const phrase = new Phrase({
        distribution: 'D',
        environment: 'S',
        cacheExpirationTime: 60,
        storage,
      });
      setGlobalFetch(makeFetch(200));
      await phrase.requestTranslations('en');
      expect(storage.data.get('UUID')).toBe(V4_UUID);
    });

    test('concurrent requestTranslations calls write UUID only once', async () => {
      const storage = new FakeStorage();
      const phrase = new Phrase({
        distribution: 'D',
        environment: 'S',
        cacheExpirationTime: 60,
        storage,
      });
      setGlobalFetch(makeFetch(200));
      await Promise.all([
        phrase.requestTranslations('en'),
        phrase.requestTranslations('fr'),
      ]);
      const uuidWrites = storage.calls.filter((c) => c === 'set:UUID');
      expect(uuidWrites).toHaveLength(1);
    });
  });

  describe('custom storage injection', () => {
    test('all reads and writes go through the provided storage', async () => {
      const storage = new FakeStorage();
      const phrase = new Phrase({
        distribution: 'D',
        environment: 'S',
        cacheExpirationTime: 60,
        storage,
      });
      setGlobalFetch(makeFetch(200));
      await phrase.requestTranslations('en');
      expect(storage.calls.length).toBeGreaterThan(0);
    });
  });

  describe('debug logging', () => {
    test('logs to console when debug is true', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const phrase = makePhrase({ debug: true });
      setGlobalFetch(makeFetch(200));
      await phrase.requestTranslations('en');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('empty cache after failed fetch', () => {
    test('returns empty object when cache is empty and fetch errored', async () => {
      const phrase = makePhrase();
      setGlobalFetch(makeFetch(500));
      const result = await phrase.requestTranslations('en');
      expect(result).toEqual({});
    });
  });

  describe('304 on first request with empty cache', () => {
    test('returns empty object and does not lock out future fetches', async () => {
      const phrase = makePhrase();
      setGlobalFetch(makeFetch(304));
      const result = await phrase.requestTranslations('en');
      expect(result).toEqual({});

      const fetch200 = makeFetch(200);
      setGlobalFetch(fetch200);
      const result2 = await phrase.requestTranslations('en');
      expect(fetch200).toHaveBeenCalledTimes(1);
      expect(result2).toEqual(mockResponse);
    });
  });

  describe('last_update key', () => {
    test('last_update is stored per-locale and sent on subsequent requests', async () => {
      const storage = new FakeStorage();
      const phrase = makePhrase({ storage });
      setGlobalFetch(makeFetch(200));
      await phrase.requestTranslations('en');

      storage.data.set('MY_DISTRIBUTION::MY_SECRET::en::expiration', '0');

      const fetch2 = makeFetch(200);
      setGlobalFetch(fetch2);
      await phrase.requestTranslations('en');

      const secondCallUrl: URL = (fetch2.mock.calls[0] as any[])[0];
      expect(secondCallUrl.searchParams.has('last_update')).toBe(true);
    });
  });

  describe('cacheExpirationTime default', () => {
    test('defaults to 300 seconds when not provided', () => {
      const phrase = new Phrase({ distribution: 'D', environment: 'S', storage: new FakeStorage() });
      expect((phrase as any).options.cacheExpirationTime).toBe(300);
    });
  });

  describe('datacenter option', () => {
    test('uses EU datacenter by default', async () => {
      const fetchMock = makeFetch(200);
      setGlobalFetch(fetchMock);
      await makePhrase().requestTranslations('en');
      const url: URL = (fetchMock.mock.calls[0] as any[])[0];
      expect(url.origin).toBe(Datacenter.EU);
    });

    test('uses US datacenter when specified', async () => {
      const fetchMock = makeFetch(200);
      setGlobalFetch(fetchMock);
      await makePhrase({ datacenter: Datacenter.US }).requestTranslations('en');
      const url: URL = (fetchMock.mock.calls[0] as any[])[0];
      expect(url.origin).toBe(Datacenter.US);
    });

    test('host overrides datacenter', async () => {
      const fetchMock = makeFetch(200);
      setGlobalFetch(fetchMock);
      await makePhrase({ host: 'https://custom.example.com', datacenter: Datacenter.US }).requestTranslations('en');
      const url: URL = (fetchMock.mock.calls[0] as any[])[0];
      expect(url.origin).toBe('https://custom.example.com');
    });
  });

  describe('format option', () => {
    test('uses the provided format in API requests', async () => {
      const fetchMock = makeFetch(200);
      setGlobalFetch(fetchMock);
      const phrase = makePhrase({ format: 'i18next_4' });
      await phrase.requestTranslations('en');
      const url: URL = (fetchMock.mock.calls[0] as any[])[0];
      expect(url.pathname).toContain('i18next_4');
    });
  });

  describe('default storage (no storage option provided)', () => {
    test('falls back to defaultStorage when storage is omitted', async () => {
      const phrase = new Phrase({ distribution: 'D', environment: 'S', cacheExpirationTime: 60 });
      setGlobalFetch(makeFetch(200));
      const result = await phrase.requestTranslations('en');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('response with a version string', () => {
    test('stores the version returned by the server', async () => {
      const storage = new FakeStorage();
      const phrase = new Phrase({ distribution: 'D', environment: 'S', cacheExpirationTime: 60, storage });
      const versionedFetch = jest.fn(() =>
        Promise.resolve({
          status: 200,
          ok: true,
          url: 'https://ota.eu.phrase.com/dist/secret/en/i18next?version=42',
          text: () => Promise.resolve(JSON.stringify(mockResponse)),
        }),
      ) as jest.Mock;
      setGlobalFetch(versionedFetch);
      await phrase.requestTranslations('en');
      expect(storage.data.get('D::S::en::current_version')).toBe('42');
    });
  });

  describe('uuidPromise recovery after storage error', () => {
    test('clears the poisoned promise so the next call can retry', async () => {
      const storage = new FakeStorage();
      let callCount = 0;
      const originalGetItem = storage.getItem.bind(storage);
      storage.getItem = async (key: string) => {
        callCount++;
        if (callCount === 1) throw new Error('storage unavailable');
        return originalGetItem(key);
      };

      const phrase = new Phrase({ distribution: 'D', environment: 'S', cacheExpirationTime: 60, storage });
      setGlobalFetch(makeFetch(200));

      const result1 = await phrase.requestTranslations('en');
      expect(result1).toEqual({});
      expect((phrase as any).uuidPromise).toBeNull();

      const result2 = await phrase.requestTranslations('en');
      expect(result2).toEqual(mockResponse);
    });
  });

  describe('clearCache', () => {
    test('clears the underlying storage and resets UUID memoization', async () => {
      const storage = new FakeStorage();
      const phrase = makePhrase({ storage });
      setGlobalFetch(makeFetch(200));
      await phrase.requestTranslations('en');
      await phrase.clearCache();

      expect(storage.data.size).toBe(0);
      expect((phrase as any).uuidPromise).toBeNull();
    });
  });
});
