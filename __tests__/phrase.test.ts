import {describe, expect, test} from '@jest/globals';
import Phrase, {PHRASE_SDK_VERSION} from '../src/phrase';

const V4_UUID = "b54f7566-6d85-4d97-9960-2ad82edfe317";
jest.mock('uuid', () => ({ v4: () => V4_UUID }));

describe('requestTranslations', () => {  
  const phrase = new Phrase({
    distribution: 'MY_DISTRIBUTION',
    secret: 'MY_SECRET',
    cacheExpirationTime: 1000,
  });

  const mockResponse = {
    translations: {
      foo: 'bar',
    }
  };

  const mockFetch = (responseCode: number) => {
    return jest.fn(() =>
      Promise.resolve({
        status: responseCode,
        ok: responseCode >= 200 && responseCode <= 399,
        url: 'https://example.com/foo',
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      }),
    ) as jest.Mock;
  }
  beforeEach(() => {
    phrase.clearCache();
  });

  describe('when the request is successful', () => {
    let fetchMock: jest.Mock<any, any, any>;

    beforeEach(() => {
      fetchMock = mockFetch(200);
      global.fetch = fetchMock;
    });

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

    test('the request is executed with proper parameters', async () => {
      await phrase.requestTranslations('en');
      expect(fetchMock).toHaveBeenCalledWith(
        new URL(`https://ota.eu.phrase.com/MY_DISTRIBUTION/MY_SECRET/en/i18next?client=i18next&sdk_version=${PHRASE_SDK_VERSION}&unique_identifier=${V4_UUID}`),
        expect.anything(),
      );
    });
  });

  describe('when the request is not successful', () => {
    let fetchMock: jest.Mock<any, any, any>;

    beforeEach(() => {
      fetchMock = mockFetch(400);
      global.fetch = fetchMock;
    });

    test('should return empty object', async () => {
      const translations = await phrase.requestTranslations('en');
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(translations).toEqual({});
    });
  });
});
