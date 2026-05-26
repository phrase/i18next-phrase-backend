import { PhraseStorage } from './types';

export default class LocalStorageAdapter implements PhraseStorage {
  private readonly prefix: string;

  constructor(prefix: string = '') {
    this.prefix = prefix;
  }

  async getItem(key: string): Promise<string | null> {
    return localStorage.getItem(this.prefix + key);
  }

  async setItem(key: string, value: string): Promise<void> {
    localStorage.setItem(this.prefix + key, value);
  }

  async clear(): Promise<void> {
    const keysToRemove = Object.keys(localStorage).filter(k => k.startsWith(this.prefix));
    keysToRemove.forEach(k => localStorage.removeItem(k));
  }
}
