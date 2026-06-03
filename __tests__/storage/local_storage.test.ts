/**
 * @jest-environment jsdom
 */
import { describe, expect, test, beforeEach } from '@jest/globals';
import LocalStorage from '../../src/storage/local_storage';

describe('LocalStorage', () => {
  let adapter: LocalStorage;

  beforeEach(() => {
    localStorage.clear();
    adapter = new LocalStorage();
  });

  test('returns null for missing keys', async () => {
    expect(await adapter.getItem('missing')).toBeNull();
  });

  test('stores and retrieves a value', async () => {
    await adapter.setItem('key', 'value');
    expect(await adapter.getItem('key')).toBe('value');
  });

  test('overwrites an existing key', async () => {
    await adapter.setItem('key', 'first');
    await adapter.setItem('key', 'second');
    expect(await adapter.getItem('key')).toBe('second');
  });

  test('clear with no prefix removes all stored values', async () => {
    await adapter.setItem('a', '1');
    await adapter.setItem('b', '2');
    await adapter.clear();
    expect(await adapter.getItem('a')).toBeNull();
    expect(await adapter.getItem('b')).toBeNull();
  });

  test('getItem resolves a Promise', async () => {
    await adapter.setItem('k', 'v');
    const result = adapter.getItem('k');
    expect(result).toBeInstanceOf(Promise);
    expect(await result).toBe('v');
  });

  describe('with a prefix', () => {
    beforeEach(() => {
      localStorage.clear();
      adapter = new LocalStorage('phrase::');
    });

    test('prepends the prefix to get and set operations', async () => {
      await adapter.setItem('a', '1');
      expect(localStorage.getItem('phrase::a')).toBe('1');
      expect(await adapter.getItem('a')).toBe('1');
    });

    test('clear only removes keys starting with the prefix', async () => {
      await adapter.setItem('a', '1');
      await adapter.setItem('b', '2');
      localStorage.setItem('other::c', '3');
      await adapter.clear();
      expect(await adapter.getItem('a')).toBeNull();
      expect(await adapter.getItem('b')).toBeNull();
      expect(localStorage.getItem('other::c')).toBe('3');
    });

    test('clear leaves unrelated keys intact when nothing matches the prefix', async () => {
      localStorage.setItem('unrelated', 'value');
      await adapter.clear();
      expect(localStorage.getItem('unrelated')).toBe('value');
    });
  });
});
