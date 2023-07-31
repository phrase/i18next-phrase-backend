export class PhraseResponse {
    version: string | null;
    body: string;
    constructor(version: string | null, body: string) {
        this.version = version;
        this.body = body;
    }
}

class PhraseApiError extends Error {
}

export class PhraseApi {
    baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async getTranslations(distribution: string, secret: string, locale: string, fileFormat: string, uuid: string, sdkVersion: string, currentVersion: string | null, appVersion: string | undefined, lastUpdate: string | null): Promise<PhraseResponse | null> {
        const params = Object.entries({
            client: 'i18next',
            sdk_version: sdkVersion,
            unique_identifier: uuid,
            current_version: currentVersion,
            app_version: appVersion,
            last_update: lastUpdate
        }).filter(([_key, value]) => { return value != null; }) as [string, string][];

        const url = new URL(`${this.baseUrl}/${distribution}/${secret}/${locale}/${fileFormat}`);
        url.search = new URLSearchParams(params).toString();

        const response = await fetch(url, {
            method: 'GET',
            mode: "cors",
            headers: {
                'Accept': 'application/json',
            }
        });
        const code = response.status
        if (code >= 200 && code <= 299) {
            const url = new URL(response.url);
            const version = url.searchParams.get('version');
            const json = await response.json();

            return new PhraseResponse(version, json);
        } else if (code === 304) {
            return null;
        } else {
            throw new PhraseApiError("HTTP code " + code);
        }
    }
}
