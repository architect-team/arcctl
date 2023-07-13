import * as path from 'std/path/mod.ts';
import { SupportedProviders } from '../@providers/index.ts';

export type SecretAccount = {
  provider: keyof typeof SupportedProviders;
  credentials: any;
};

export class SecretStore {
  private _secretAccount?: SecretAccount;

  constructor(
    private config_dir: string = Deno.makeTempDirSync(),
    private secret_filename: string = 'secret-account.json',
  ) {
    this.get();
  }

  private get secret_account_config_file() {
    return path.join(this.config_dir, this.secret_filename);
  }

  public async save(secretAccount: SecretAccount): Promise<void> {
    await Deno.mkdir(path.dirname(this.secret_account_config_file), {
      recursive: true,
    });
    await Deno.writeTextFile(this.secret_account_config_file, JSON.stringify(secretAccount, null, 2));
    this._secretAccount = secretAccount;
  }

  public async get(): Promise<SecretAccount> {
    if (this._secretAccount) {
      return this._secretAccount;
    }

    try {
      const fileContents = Deno.readTextFileSync(this.secret_account_config_file);
      this._secretAccount = JSON.parse(fileContents);
    } catch {
      const secretLocation = path.join(this.config_dir, 'secrets');
      await Deno.mkdir(secretLocation, { recursive: true });
      this._secretAccount = {
        provider: 'local',
        credentials: {
          directory: secretLocation,
        },
      };
    }

    return this._secretAccount!;
  }

  public async remove(): Promise<void> {
    await Deno.remove(this.secret_account_config_file);
  }
}
