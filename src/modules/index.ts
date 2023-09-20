type BuildRequest = {
  directory: string;
};

type BuildResponse = {
  image: string;
};

type ApplyRequest = {
  datacenterid: string;
  image: string;
  inputs: [string, string][];
  pulumistate?: string;
  destroy?: boolean;
};

type ApplyResponse = {
  pulumistate: string;
  outputs: Record<string, string>;
};

class ModuleClient {
  public async Build(body: BuildRequest): Promise<BuildResponse> {
    const resp = await fetch('http://localhost:50051/build', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return resp.json();
  }

  public async Apply(body: ApplyRequest): Promise<ApplyResponse> {
    const resp = await fetch('http://localhost:50051/apply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return resp.json();
  }
}

const getModuleClient = () => {
  return new ModuleClient();
};

const startContainer = async (directory?: string): Promise<Deno.ChildProcess> => {
  const command = new Deno.Command('docker', {
    args: [
      'run',
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
  // deno-lint-ignore no-async-promise-executor
  return new Promise(async (resolve) => {
    const writable = new WritableStream<Uint8Array>({
      write: async (chunk) => {
        const output = new TextDecoder().decode(chunk);
        if (output.includes('Started server on port')) {
          resolve(process);
        }
      },
    });
    process.stdout?.pipeTo(writable);
  });
};

const stopContainer = async (child: Deno.ChildProcess): Promise<void> => {
  child.kill();
  await child.status;
};

export const Build = async (options: { directory: string }) => {
  try {
    Deno.statSync(`${options.directory}/Dockerfile`);
  } catch (err) {
    throw new Error(`A Dockerfile must exist at ${options.directory}`);
  }

  const childProcess = await startContainer(options.directory);
  try {
    const client = getModuleClient();
    const response = await client.Build(options);
    await stopContainer(childProcess);
    return response;
  } catch (e) {
    await stopContainer(childProcess);
    throw e;
  }
};

export const Apply = async (
  options: {
    datacenterid: string;
    image: string;
    inputs: [string, string][];
    pulumistate?: string;
    destroy?: boolean;
  },
): Promise<ApplyResponse> => {
  const childProcess = await startContainer();
  try {
    const client = getModuleClient();
    const response = await client.Apply(options);
    await stopContainer(childProcess);
    return response;
  } catch (e) {
    await stopContainer(childProcess);
    throw e;
  }
};
