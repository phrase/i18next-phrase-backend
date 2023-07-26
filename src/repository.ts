export default class Repository {
    private storage: Storage;

    constructor() {
        if (typeof (Storage) !== "undefined") {
            this.storage = localStorage;
        } else {
            // TODO handle case when localStorage is not available
            throw new Error("localStorage is not available");
        }
    }

    setItem(key: string, value: string) {
        this.storage.setItem(key, value);
    }

    getItem(key: string): string | null {
        return this.storage.getItem(key);
    }
}
