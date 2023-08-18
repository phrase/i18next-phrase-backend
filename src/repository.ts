import MemoryStorage from "./memory_storage";

export default class Repository {
    private storage: Storage;

    constructor() {
        if (this.isLocalStorageAvailable()) {
            this.storage = localStorage;
        } else {
            this.storage = new MemoryStorage();
        }
    }

    setItem(key: string, value: string) {
        this.storage.setItem(key, value);
    }

    getItem(key: string): string | null {
        return this.storage.getItem(key);
    }

    clear() {
        this.storage.clear();
    }

    isLocalStorageAvailable(): boolean {
        if (typeof localStorage !== 'undefined') {
            try {
                localStorage.setItem('i18next-phrase-backend::storage', 'enabled');
                if (localStorage.getItem('i18next-phrase-backend::storage') === 'enabled') {
                    localStorage.removeItem('i18next-phrase-backend::storage');
                    return true;
                }
            } catch {
            }
        }

        return false;
    }
}
