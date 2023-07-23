import { Buffer } from 'std/io/buffer.ts';

enum NativeCredentialsCommand {
  Erase = 'erase',
  Get = 'get',
  List = 'list',
  Store = 'store',
  Version = 'version',
}

export type NativeCredentials = {
  ServerURL: string;
  Username: string;
  Secret: string;
};

export class NativeCredentialsClient {
  private programFunc: string;

  constructor(helperSuffix: string) {
    this.programFunc = `docker-credential-${helperSuffix}`;
  }

  private async exec(command: NativeCredentialsCommand, stdin?: string): Promise<{
    code: number;
    stdout: string;
    stderr: string;
  }> {
    const cmd = new Deno.Command(this.programFunc, {
      args: [command],
      stdout: 'piped',
      stdin: 'piped',
      stderr: 'piped',
    });

    const stdout = new Buffer();
    const stderr = new Buffer();

    const child = cmd.spawn();

    child.stdout.pipeTo(
      new WritableStream({
        write(chunk) {
          stdout.writeSync(chunk);
        },
      }),
    );

    child.stderr.pipeTo(
      new WritableStream({
        write(chunk) {
          stderr.writeSync(chunk);
        },
      }),
    );

    const writer = child.stdin.getWriter();
    if (stdin) {
      await writer.write(new TextEncoder().encode(stdin));
    }
    await writer.close();

    const status = await child.status;
    if (status.code !== 0) {
      throw new Error(
        new TextDecoder().decode(stderr.bytes()) || `Error running ${this.programFunc} ${command}`,
      );
    }

    return {
      code: status.code,
      stdout: new TextDecoder().decode(stdout.bytes()),
      stderr: new TextDecoder().decode(stderr.bytes()),
    };
  }

  public async version(): Promise<string> {
    const { code, stdout } = await this.exec(NativeCredentialsCommand.Version);
    if (code !== 0) {
      throw new Error(`Error running ${this.programFunc} ${NativeCredentialsCommand.Version}`);
    }

    const match = stdout.match(/(v[0-9]\.[0-9]\.[0-9])/);
    if (!match) {
      return 'unknown';
    }

    return match[1];
  }

  public async erase(serverAddress: string): Promise<void> {
    await this.exec(NativeCredentialsCommand.Erase, serverAddress);
  }

  public async get(serverAddress: string): Promise<NativeCredentials> {
    const { stdout } = await this.exec(NativeCredentialsCommand.Get, serverAddress);
    return JSON.parse(stdout);
  }

  public async list(): Promise<Record<string, string>> {
    const { stdout } = await this.exec(NativeCredentialsCommand.List);
    return JSON.parse(stdout);
  }

  public async store(credential: NativeCredentials): Promise<void> {
    await this.exec(
      NativeCredentialsCommand.Store,
      JSON.stringify(credential),
    );
  }
}
