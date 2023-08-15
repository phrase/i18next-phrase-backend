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

  global.fetch = jest.fn((_url, _options) =>
    Promise.resolve({
      status: 200,
      ok: true,
      url: 'https://example.com/foo',
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    }),
  ) as jest.Mock;

  test('should return a translation', async () => {
    const translations = await phrase.requestTranslations('en');
    expect(translations).toEqual(mockResponse);
  });
});
