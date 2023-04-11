export class PhraseResponse {
    version: string | null;
    json: any;
    constructor(version: string | null, json: any) {
        this.version = version;
        this.json = json;
    }
}

class PhraseApiError extends Error {
}

export default class PhraseApi {
    baseUrl: any;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async getTranslations(distribution: string, environment: string, locale: string, fileFormat: string, uuid: string, sdkVersion: string, currentVersion: string, appVersion: string) {
        let params = {
            client: 'react_native',
            sdk_version: sdkVersion,
            unique_identifier: uuid,
            current_version: currentVersion,
            app_version: appVersion,
        };
        // if (currentVersion != null) params['current_version'] = currentVersion;
        // if (appVersion != null) params['app_version'] = appVersion;

        const url = new URL(`${this.baseUrl}/${distribution}/${environment}/${locale}/${fileFormat}`);
        url.search = new URLSearchParams(params).toString();

        let response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        let code = response.status
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
