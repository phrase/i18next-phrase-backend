import { PhraseStorage } from '../../src/storage/types';

export class FakeStorage implements PhraseStorage {
  public data: Map<string, string> = new Map();
  public calls: string[] = [];

  async getItem(key: string): Promise<string | null> {
    this.calls.push(`get:${key}`);
    return this.data.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.calls.push(`set:${key}`);
    this.data.set(key, value);
  }

  async clear(): Promise<void> {
    this.calls.push('clear');
    this.data.clear();
  }
}
