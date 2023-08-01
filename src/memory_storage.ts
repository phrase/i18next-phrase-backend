export default class MemoryStorage implements Storage {
    length: number = 0;

    private data: Map<string, string> = new Map<string, string>();

    clear(): void {
        this.data.clear();
    }

    getItem(key: string): string | null {
        return this.data.get(key) || null;
    }
    key(index: number): string | null {
        throw new Error("Method not implemented.");
    }
    removeItem(key: string): void {
        this.data.delete(key);
    }
    setItem(key: string, value: string): void {
        this.data.set(key, value);
    }
}
