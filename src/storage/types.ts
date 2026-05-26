export interface PhraseStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  clear(): Promise<void>;
}
