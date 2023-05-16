export type Translation = {
    [key: string]: string | Translation | [string | Translation]
}

export class PhraseResponse {
    version: string | null;
    json: Translation;
    constructor(version: string | null, json: Translation) {
        this.version = version;
        this.json = json;
    }
}

class PhraseApiError extends Error {
}

export default class PhraseApi {
    baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async getTranslations(distribution: string, secret: string, locale: string, fileFormat: string, uuid: string, sdkVersion: string, currentVersion: string, appVersion: string) {
        const params = {
            client: 'react_native',
            sdk_version: sdkVersion,
            unique_identifier: uuid,
            current_version: currentVersion,
            app_version: appVersion,
        };
        // if (currentVersion != null) params['current_version'] = currentVersion;
        // if (appVersion != null) params['app_version'] = appVersion;

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
