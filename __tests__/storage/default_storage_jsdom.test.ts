/**
 * @jest-environment jsdom
 */
import { describe, expect, test, afterEach } from '@jest/globals';
import { defaultStorage } from '../../src/storage/default_storage';
import LocalStorage from '../../src/storage/local_storage';
import MemoryStorage from '../../src/storage/memory_storage';

describe('defaultStorage (jsdom env, localStorage available)', () => {
  test('returns a LocalStorage instance', () => {
    expect(defaultStorage()).toBeInstanceOf(LocalStorage);
  });

  test('returned storage is functional', async () => {
    const storage = defaultStorage();
    await storage.setItem('y', 'hello');
    expect(await storage.getItem('y')).toBe('hello');
  });
});

describe('defaultStorage (localStorage throws on setItem)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('falls back to MemoryStorage when localStorage.setItem throws', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });
    expect(defaultStorage()).toBeInstanceOf(MemoryStorage);
  });

  test('falls back to MemoryStorage when localStorage returns wrong probe value', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('corrupted');
    expect(defaultStorage()).toBeInstanceOf(MemoryStorage);
  });
});
