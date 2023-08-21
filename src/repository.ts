import MemoryStorage from "./memory_storage";

export default class Repository {
    private storage: Storage;

    KEY_PREFIX = 'i18next-phrase-backend::';

    constructor() {
        if (this.isLocalStorageAvailable()) {
            this.storage = localStorage;
        } else {
            this.storage = new MemoryStorage();
        }
    }

    setItem(key: string, value: string) {
        this.storage.setItem(`${this.KEY_PREFIX}${key}`, value);
    }

    getItem(key: string): string | null {
        return this.storage.getItem(`${this.KEY_PREFIX}${key}`);
    }

    clear() {
        this.storage.clear();
    }

    isLocalStorageAvailable(): boolean {
        if (typeof localStorage !== 'undefined') {
            try {
                localStorage.setItem(`${this.KEY_PREFIX}storage`, 'enabled');
                if (localStorage.getItem(`${this.KEY_PREFIX}storage`) === 'enabled') {
                    localStorage.removeItem(`${this.KEY_PREFIX}storage`);
                    return true;
                }
            } catch {
            }
        }

        return false;
    }
}
