import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { I18nextPhraseBackend } from '../src/i18next_phrase_backend';
import Phrase, { Options } from '../src/phrase';
import { FakeStorage } from './helpers/fake_storage';

jest.mock('../src/phrase');

const translations = { foo: 'bar' };
const options: Options = {
  distribution: 'MY_DISTRIBUTION',
  environment: 'MY_SECRET',
  cacheExpirationTime: 60,
};

jest
  .spyOn(Phrase.prototype, 'requestTranslations')
  .mockImplementation(() => Promise.resolve(translations));

describe('I18nextPhraseBackend', () => {
  describe('init', () => {
    test('throws if distribution is missing', () => {
      const backend = new I18nextPhraseBackend({}, {} as Options);
      expect(() => backend.init({}, { environment: 'S', cacheExpirationTime: 60 } as Options)).toThrow(
        'distribution and environment are required',
      );
    });

    test('throws if environment is missing', () => {
      const backend = new I18nextPhraseBackend({}, {} as Options);
      expect(() =>
        backend.init({}, { distribution: 'D', cacheExpirationTime: 60 } as Options),
      ).toThrow('distribution and environment are required');
    });

    test('accepts a custom storage option', () => {
      const backend = new I18nextPhraseBackend({}, {} as Options);
      const storage = new FakeStorage();
      expect(() =>
        backend.init({}, { ...options, storage }),
      ).not.toThrow();
    });

  });

  describe('read called before init', () => {
    test('does not throw and never calls the callback', () => {
      const uninitialised = new I18nextPhraseBackend({}, {} as Options);
      const cb = jest.fn();
      expect(() => uninitialised.read('en', 'ns', cb)).not.toThrow();
      expect(cb).not.toHaveBeenCalled();
    });
  });

  describe('read', () => {
    let backend: I18nextPhraseBackend;
    let mockCallback: jest.Mock;

    beforeEach(() => {
      backend = new I18nextPhraseBackend({}, {} as Options);
      backend.init({}, options);
      mockCallback = jest.fn();
    });

    test('invokes the callback with translations on success', async () => {
      backend.read('en', 'ns', mockCallback);
      await Promise.resolve();
      expect(mockCallback).toHaveBeenCalledWith(null, translations);
    });

    test('invokes the callback with error on failure', async () => {
      const err = new Error('network error');
      jest.spyOn(Phrase.prototype, 'requestTranslations').mockRejectedValueOnce(err);
      backend.read('en', 'ns', mockCallback);
      await new Promise((r) => setTimeout(r, 0));
      expect(mockCallback).toHaveBeenCalledWith(err, null);
    });
  });
});
