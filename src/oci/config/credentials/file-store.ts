import { AuthConfig } from '../types/auth.ts';
import { AuthsFile } from './auths-file.ts';
import { Store } from './store.ts';

export class FileStore implements Store {
  private file: AuthsFile;

  constructor(file: AuthsFile) {
    this.file = file;
  }

  private convertToHostname(url: string): string {
    if (url.includes('://')) {
      const { hostname } = new URL(url);
      return hostname;
    }

    return url;
  }

  isFileStore(): boolean {
    return true;
  }

  erase(serverAddress: string): Promise<void> {
    delete this.file.auths[serverAddress];
    this.file.save();
    return Promise.resolve();
  }

  get(serverAddress: string): Promise<AuthConfig | undefined> {
    const authConfig = this.file.auths[serverAddress];
    if (authConfig) return Promise.resolve(authConfig);

    for (const [key, value] of Object.entries(this.file.auths)) {
      if (serverAddress === this.convertToHostname(key)) {
        return Promise.resolve(value);
      }
    }

    return Promise.resolve(undefined);
  }

  getAll(): Promise<Record<string, AuthConfig>> {
    return Promise.resolve(this.file.auths);
  }

  store(authConfig: AuthConfig): Promise<void> {
    if (!authConfig.serveraddress) {
      throw new Error('Configs must specify a serveraddress');
    }

    this.file.auths[authConfig.serveraddress] = authConfig;
    this.file.save();
    return Promise.resolve();
  }
}
