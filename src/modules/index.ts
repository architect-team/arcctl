import { Logger } from 'winston';

export type BuildRequest = {
  directory: string;
};

export type BuildOptions = {
  verbose?: boolean;
};

export type BuildResponse = {
  image: string;
};

export type ApplyRequest = {
  datacenterid: string;
  image: string;
  inputs: [string, string][];
  state?: string;
  destroy?: boolean;
};

export type ApplyResponse = {
  state: string;
  outputs: Record<string, string>;
};

export type ApplyOptions = {
  logger?: Logger;
};

function wsPromise(
  command: string,
  request: BuildRequest | ApplyRequest,
  verbose: boolean,
  logger?: Logger,
): Promise<BuildResponse | ApplyResponse> {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket('ws://localhost:50051/ws');
    socket.addEventListener('open', () => {
      socket.send(JSON.stringify({
        command,
        request,
      }));
    });

    socket.addEventListener('message', (event) => {
      try {
        const evt = JSON.parse(event.data);
        if (evt.verboseOutput) {
          if (verbose) {
            console.log(evt.verboseOutput);
          } else if (logger) {
            logger.info(evt.verboseOutput);
          }
        } else if (evt.error) {
          reject(evt.error);
        } else if (evt.result) {
          resolve(evt.result);
        }
      } catch (e) {
        // Failed to parse message, invalid response
        reject(e);
      }
    });
  });
}

class ModuleClient {
  public async Build(buildRequest: BuildRequest, options?: BuildOptions): Promise<BuildResponse> {
    const verbose = Boolean(options && options.verbose);
    return wsPromise('build', buildRequest, verbose) as Promise<BuildResponse>;
  }

  public async Apply(applyRequest: ApplyRequest, options?: ApplyOptions): Promise<ApplyResponse> {
    return wsPromise('apply', applyRequest, false, options?.logger) as Promise<ApplyResponse>;
  }
}

const getModuleClient = () => {
  return new ModuleClient();
};

const startContainer = async (directory?: string): Promise<Deno.ChildProcess> => {
  const command = new Deno.Command('docker', {
    args: [
      'run',
      //'--rm',
      '-p',
      '50051:50051',
      '-v',
      '/var/run/docker.sock:/var/run/docker.sock',
      ...(directory ? ['-v', `${directory}:${directory}`] : []),
      'pulumi', // build this from https://github.com/architect-team/pulumi-module
    ],
    stdout: 'piped',
    stderr: 'piped',
  });
  const process = command.spawn();

  return new Promise((resolve, reject) => {
    // Resolve once we see the server has started in the container.
    process.stdout.pipeTo(
      new WritableStream({
        write: async (chunk) => {
          const output = new TextDecoder().decode(chunk);
          if (output.includes('Started server on port')) {
            resolve(process);
          }
        },
      }),
    );

    process.stderr.pipeTo(
      new WritableStream({
        write(chunk) {
          const error = new TextDecoder().decode(chunk);
          reject(error);
        },
      }),
    );
  });
};

const stopContainer = async (child: Deno.ChildProcess): Promise<void> => {
  child.kill();
  await child.status;
};

export class ModuleHelpers {
  public static async Build(request: BuildRequest, options: BuildOptions) {
    try {
      Deno.statSync(`${request.directory}/Dockerfile`);
    } catch (err) {
      throw new Error(`A Dockerfile must exist at ${request.directory}`);
    }
  
    const childProcess = await startContainer(request.directory);
    try {
      const client = getModuleClient();
      const response = await client.Build(request, options);
      await stopContainer(childProcess);
      return response;
    } catch (e) {
      await stopContainer(childProcess);
      throw e;
    }
  }

  public static async Apply(
    request: ApplyRequest,
    options: {
      logger?: Logger;
    },
  ): Promise<ApplyResponse> {
    const childProcess = await startContainer();
    try {
      const client = getModuleClient();
      const response = await client.Apply(request, { logger: options.logger });
      await stopContainer(childProcess);
      return response;
    } catch (e) {
      await stopContainer(childProcess);
      throw e;
    }
  };
}
