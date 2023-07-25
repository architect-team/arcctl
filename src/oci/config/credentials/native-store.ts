import { AuthConfig } from '../types/auth.ts';
import { AuthsFile } from './auths-file.ts';
import { FileStore } from './file-store.ts';
import { NativeCredentialsClient } from './native-client.ts';
import { Store } from './store.ts';

// https://github.com/docker/cli/blob/v24.0.4/cli/config/credentials/native_store.go#L9
const TOKEN_USERNAME = '<token>';

export class NativeStore implements Store {
  private client: NativeCredentialsClient;
  private fileStore: Store;

  constructor(file: AuthsFile, helperSuffix: string) {
    this.client = new NativeCredentialsClient(helperSuffix);
    this.fileStore = new FileStore(file);
  }

  private async getCredentialsFromStore(serverAddress: string): Promise<AuthConfig> {
    const creds = await this.client.get(serverAddress);

    const res: AuthConfig = {};
    if (creds.Username === TOKEN_USERNAME) {
      res.identitytoken = creds.Secret;
    } else {
      res.password = creds.Secret;
      res.username = creds.Username;
    }

    res.serveraddress = serverAddress;
    return res;
  }

  private storeCredentialsInStore(authConfig: AuthConfig): Promise<void> {
    if (!authConfig.serveraddress) {
      throw new Error(`Cannot store AuthConfig w/out a server address`);
    }

    const creds = {
      ServerURL: authConfig.serveraddress,
      Username: authConfig.username || '',
      Secret: authConfig.password || '',
    };

    if (authConfig.identitytoken) {
      creds.Username = TOKEN_USERNAME;
      creds.Secret = authConfig.identitytoken;
    }

    return this.client.store(creds);
  }

  async erase(serverAddress: string): Promise<void> {
    try {
      return this.client.erase(serverAddress);
    } catch {
      return this.fileStore.erase(serverAddress);
    }
  }

  async get(serverAddress: string): Promise<AuthConfig | undefined> {
    const auth = (await this.fileStore.get(serverAddress)) || {};

    try {
      const creds = await this.getCredentialsFromStore(serverAddress);
      auth.username = creds.username;
      auth.identitytoken = creds.identitytoken;
      auth.password = creds.password;
    } catch {
      // Intentionally left blank
    }

    return Object.keys(auth).length > 0 ? auth : undefined;
  }

  async getAll(): Promise<Record<string, AuthConfig>> {
    const auths = await this.client.list();
    const fileConfigs = await this.fileStore.getAll();

    const res: Record<string, AuthConfig> = {};
    for (const [key, value] of Object.entries(auths)) {
      const creds = await this.getCredentialsFromStore(key);
      res[key] = {
        ...fileConfigs[key],
        username: creds.username,
        password: creds.password,
        identitytoken: creds.identitytoken,
      };
    }

    return res;
  }

  async store(authConfig: AuthConfig): Promise<void> {
    await this.storeCredentialsInStore(authConfig);

    delete authConfig.username;
    delete authConfig.password;
    delete authConfig.identitytoken;

    return this.fileStore.store(authConfig);
  }

  isFileStore(): boolean {
    return false;
  }
}
