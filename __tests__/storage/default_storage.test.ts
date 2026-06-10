import { describe, expect, test } from '@jest/globals';
import { defaultStorage } from '../../src/storage/default_storage';
import MemoryStorage from '../../src/storage/memory_storage';
import LocalStorage from '../../src/storage/local_storage';

// Node test environment: localStorage is undefined → always falls back to MemoryStorage
describe('defaultStorage (node env, no localStorage)', () => {
  test('returns a MemoryStorage instance', () => {
    expect(defaultStorage()).toBeInstanceOf(MemoryStorage);
  });

  test('returned storage is functional', async () => {
    const storage = defaultStorage();
    await storage.setItem('x', '42');
    expect(await storage.getItem('x')).toBe('42');
  });
});
