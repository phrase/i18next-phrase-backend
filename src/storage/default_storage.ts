import { PhraseStorage } from './types';
import LocalStorage from './local_storage';
import MemoryStorage from './memory_storage';

const KEY_PREFIX = 'i18next-phrase-backend::';

function isLocalStorageAvailable(): boolean {
  const testKey = '__phrase_storage_test__';
  try {
    if (typeof localStorage === 'undefined') return false;
    localStorage.setItem(testKey, '1');
    if (localStorage.getItem(testKey) !== '1') return false;
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function defaultStorage(): PhraseStorage {
  return isLocalStorageAvailable() ? new LocalStorage(KEY_PREFIX) : new MemoryStorage();
}
