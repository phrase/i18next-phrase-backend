import {describe, expect, test} from '@jest/globals';
import { I18nextPhraseBackend } from "../src/i18next_phrase_backend";
import Phrase, { Options } from '../src/phrase';

jest.mock('../src/phrase');

const translations = {
  foo: 'bar',
};

const options = {
  distribution: 'MY_DISTRIBUTION',
  secret: 'MY_SECRET',
} as Options;

jest
  .spyOn(Phrase.prototype, 'requestTranslations')
  .mockImplementation((_localeCode) => {
    return Promise.resolve(translations)
  });

describe('I18nextPhraseBackend', () => {
  const phraseBackend = new I18nextPhraseBackend({}, {} as Options);
  phraseBackend.init({}, options);
  const mockReadCallback = jest.fn();

  describe('read', () => {
    beforeEach(() => {
      phraseBackend.read('en', 'namespace', mockReadCallback);
    });

    test('should invoke the callback with translations', async () => {
      expect(mockReadCallback).toHaveBeenCalledTimes(1);
      expect(mockReadCallback).toHaveBeenCalledWith(null, translations);
    });
  });
});
