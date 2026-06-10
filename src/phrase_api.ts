export type PhraseResponse = { version: string | null; body: string };

class PhraseApiError extends Error {}

interface PhraseApiConfig {
  baseUrl: string;
  distribution: string;
  environment: string;
  fileFormat: string;
  sdkVersion: string;
  appVersion?: string;
}

export class PhraseApi {
  private readonly config: PhraseApiConfig;

  constructor(config: PhraseApiConfig) {
    this.config = config;
  }

  async getTranslations(request: {
    locale: string;
    uuid: string;
    currentVersion: string | null;
    lastUpdate: string | null;
  }): Promise<PhraseResponse | null> {
    const { baseUrl, distribution, environment, fileFormat, sdkVersion, appVersion } = this.config;
    const { locale, uuid, currentVersion, lastUpdate } = request;

    const params = Object.entries({
      client: 'i18next',
      sdk_version: sdkVersion,
      unique_identifier: uuid,
      current_version: currentVersion,
      app_version: appVersion,
      last_update: lastUpdate,
    }).filter(([, value]) => value != null) as [string, string][];

    const url = new URL(`${baseUrl}/${distribution}/${environment}/${locale}/${fileFormat}`);
    url.search = new URLSearchParams(params).toString();

    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: { Accept: 'application/json' },
    });
    const code = response.status;
    if (code >= 200 && code <= 299) {
      const responseUrl = new URL(response.url);
      const version = responseUrl.searchParams.get('version');
      const json = await response.text();
      return { version, body: json };
    } else if (code === 304) {
      return null;
    } else {
      throw new PhraseApiError('HTTP code ' + code);
    }
  }
}
