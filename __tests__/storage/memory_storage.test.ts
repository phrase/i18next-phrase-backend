import { describe, expect, test, beforeEach } from '@jest/globals';
import MemoryStorage from '../../src/storage/memory_storage';

describe('MemoryStorage', () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  test('returns null for missing keys', async () => {
    expect(await storage.getItem('missing')).toBeNull();
  });

  test('stores and retrieves a value', async () => {
    await storage.setItem('key', 'value');
    expect(await storage.getItem('key')).toBe('value');
  });

  test('overwrites an existing key', async () => {
    await storage.setItem('key', 'first');
    await storage.setItem('key', 'second');
    expect(await storage.getItem('key')).toBe('second');
  });

  test('clear removes all stored values', async () => {
    await storage.setItem('a', '1');
    await storage.setItem('b', '2');
    await storage.clear();
    expect(await storage.getItem('a')).toBeNull();
    expect(await storage.getItem('b')).toBeNull();
  });

  test('getItem resolves a Promise', async () => {
    await storage.setItem('k', 'v');
    const result = storage.getItem('k');
    expect(result).toBeInstanceOf(Promise);
    expect(await result).toBe('v');
  });
});
