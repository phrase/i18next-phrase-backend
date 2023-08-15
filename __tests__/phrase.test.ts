import {describe, expect, test} from '@jest/globals';
import Phrase from '../src/phrase';

Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => 'MY_UUID',
  }
});

describe('requestTranslations', () => {
  const phrase = new Phrase({
    distribution: 'MY_DISTRIBUTION',
    secret: 'MY_SECRET',
    cacheExpirationTime: 1000,
    debug: true,
  });

  const mockResponse = {
    translations: {
      foo: 'bar',
    }
  };

  const fetchMock = jest.fn((_url, _options) =>
    Promise.resolve({
      status: 200,
      ok: true,
      url: 'https://example.com/foo',
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    }),
  ) as jest.Mock;

  global.fetch = fetchMock;

  test('should return translations', async () => {
    const translations = await phrase.requestTranslations('en');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(translations).toEqual(mockResponse);
  });

  test('two subsequent calls should only fetch once', async () => {
    await phrase.requestTranslations('en');
    await phrase.requestTranslations('en');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
