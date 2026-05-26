import { PhraseStorage } from './types';

export default class MemoryPhraseStorage implements PhraseStorage {
  private data: Map<string, string> = new Map();

  async getItem(key: string): Promise<string | null> {
    return this.data.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.data.set(key, value);
  }

  async clear(): Promise<void> {
    this.data.clear();
  }
}
