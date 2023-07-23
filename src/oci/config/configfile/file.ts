import { AuthsFile } from '../credentials/auths-file.ts';
import { FileStore } from '../credentials/file-store.ts';
import { NativeStore } from '../credentials/native-store.ts';
import { Store } from '../credentials/store.ts';
import { AuthConfig, decodeAuth, encodeAuth } from '../types/auth.ts';

type ProxyConfig = {
  httpProxy?: string;
  httpsProxy?: string;
  noProxy?: string;
  ftpProxy?: string;
  allProxy?: string;
};

export class ConfigFile implements AuthsFile {
  filename: string;
  auths: Record<string, AuthConfig>;
  HttpHeaders?: Record<string, string>;
  psFormat?: string;
  imagesFormat?: string;
  networksFormat?: string;
  pluginsFormat?: string;
  volumesFormat?: string;
  statsFormat?: string;
  detachKeys?: string;
  credsStore?: string;
  credHelpers?: Record<string, string>;
  serviceInspectFormat?: string;
  servicesFormat?: string;
  tasksFormat?: string;
  secretFormat?: string;
  configFormat?: string;
  nodesFormat?: string;
  pruneFilters?: string[];
  proxies?: Record<string, ProxyConfig>;
  experimental?: string;
  currentContext?: string;
  cliPluginsExtraDirs?: string[];
  plugins?: Record<string, Record<string, string>>;
  aliases?: Record<string, string>;

  constructor(filename: string) {
    this.filename = filename;
    this.auths = {};
    try {
      const strContents = Deno.readTextFileSync(filename);
      this.load(JSON.parse(strContents));
    } catch {
      // Intentionally left blank
    }
  }

  load(configData: Record<string, unknown>) {
    Object.assign(this, configData);

    for (const [addr, ac] of Object.entries(this.auths)) {
      if (ac.auth) {
        const { username, password } = decodeAuth(ac.auth);
        ac.username = username;
        ac.password = password;
      }

      delete ac.auth;
      ac.serveraddress = addr;
      this.auths[addr] = ac;
    }
  }

  containsAuth(): boolean {
    return Boolean(this.credsStore) ||
      Object.keys(this.credHelpers || {}).length > 0 ||
      Object.keys(this.auths).length > 0;
  }

  getAuthConfigs(): Record<string, AuthConfig> {
    return this.auths;
  }

  save(): void {
    if (!this.filename) {
      throw new Error(`Can't save config with empty filename`);
    }

    // Encode sensitive data into new struct
    const tmpAuthConfigs = { ...this.auths };
    for (const [key, authConfig] of Object.entries(this.auths)) {
      const authCopy = { ...authConfig };
      authCopy.auth = encodeAuth(authCopy);
      delete authCopy.username;
      delete authCopy.password;
      delete authCopy.serveraddress;
      tmpAuthConfigs[key] = authCopy;
    }

    // User-Agent header is automatically set, and should not be stored in the configuration
    for (const key of Object.keys(this.HttpHeaders || {})) {
      if (key.toLowerCase() === 'user-agent') {
        delete this.HttpHeaders![key];
      }
    }

    Deno.writeTextFileSync(
      this.filename,
      JSON.stringify(
        {
          ...this,
          auths: tmpAuthConfigs,
        },
        null,
        2,
      ),
    );
  }

  // References:
  //   - https://github.com/docker/cli/blob/v24.0.0-beta.2/cli/config/configfile/file.go#L179
  parseProxyConfig(host: string, runOpts: Record<string, string> = {}): Record<string, string> {
    const cfgKey = this.proxies?.[host] ? host : 'default';
    const config = this.proxies?.[cfgKey] || {};
    const permitted: Record<string, string | undefined> = {
      'HTTP_PROXY': config.httpProxy,
      'HTTPS_PROXY': config.httpsProxy,
      'NO_PROXY': config.noProxy,
      'FTP_PROXY': config.ftpProxy,
      'ALL_PROXY': config.allProxy,
    };

    for (const key in permitted) {
      if (!permitted[key]) {
        continue;
      } else if (runOpts[key]) {
        runOpts[key] = permitted[key]!;
      } else if (runOpts[key.toLowerCase()]) {
        runOpts[key.toLowerCase()] = permitted[key]!;
      }
    }

    return runOpts;
  }

  getCredentialsStore(registryHostname?: string): Store {
    let credsStore = this.credsStore || '';
    credsStore = registryHostname ? this.credHelpers?.[registryHostname] || credsStore : credsStore;
    if (credsStore) {
      return new NativeStore(this, credsStore);
    }

    return new FileStore(this);
  }

  async getAuthConfig(serverAddress: string): Promise<AuthConfig | undefined> {
    if (serverAddress.includes('registry-1.docker.io')) {
      return this.getCredentialsStore(`https://index.docker.io/v1/`).get('https://index.docker.io/v1/');
    }

    return this.getCredentialsStore(serverAddress).get(serverAddress);
  }

  async getAllCredentials(): Promise<Record<string, AuthConfig>> {
    const auths: Record<string, AuthConfig> = {};
    const defaultStore = this.getCredentialsStore('');
    const newAuths = await defaultStore.getAll();

    for (const [key, value] of Object.entries(newAuths)) {
      auths[key] = value;
    }

    // Auth configs from a registry-specific helper should override those from the default store.
    for (const registryHostname in this.credHelpers || {}) {
      const authConfig = await this.getAuthConfig(registryHostname);
      if (authConfig) {
        auths[registryHostname] = authConfig;
      }
    }

    return auths;
  }

  pluginConfig(pluginName: string, option: string): string {
    return this.plugins?.[pluginName]?.[option] || '';
  }

  setPluginConfig(pluginName: string, option: string, value?: string): void {
    this.plugins = this.plugins || {};
    this.plugins[pluginName] = this.plugins[pluginName] || {};

    if (!value) {
      delete this.plugins[pluginName][option];
    } else {
      this.plugins[pluginName][option] = value;
    }

    if (Object.keys(this.plugins[pluginName]).length === 0) {
      delete this.plugins[pluginName];
    }
  }
}
