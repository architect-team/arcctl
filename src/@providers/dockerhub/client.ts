import { DockerHubCredentials } from './credentials.ts';

const BASE_URL = 'https://hub.docker.com/v2';

export class DockerHubClient {
  private _token?: string;
  private credentials: DockerHubCredentials;

  constructor(credentials: DockerHubCredentials) {
    this.credentials = credentials;
  }

  private async login(): Promise<string> {
    if (this._token) {
      return Promise.resolve(this._token);
    }

    const response = await fetch(`${BASE_URL}/users/login/`, {
      method: 'POST',
      body: JSON.stringify(this.credentials),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (response.status >= 400) {
      throw new Error('Failed to login to Docker Hub');
    }

    const body = await response.json();
    return body.token;
  }

  async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const token = await this.login();

    const res = await fetch(`${BASE_URL}/${path}`, {
      ...options,
      headers: {
        ...options?.headers,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `JWT ${token}`,
      },
    });

    if (res.status >= 400) {
      console.log(options, await res.text());
      throw new Error(`Failed to fetch ${path}`);
    }

    return res.json();
  }
}
