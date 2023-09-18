import { getClient } from 'https://deno.land/x/grpc_basic@0.4.7/client.ts';
import { mergeReadableStreams } from 'std/streams/mod.ts';
import { ArcctlPulumi } from './arcctl_proto.d.ts';
import proto from './proto.ts';

const getModuleClient = () => {
  return getClient<ArcctlPulumi>({
    port: 50051,
    root: proto,
    serviceName: 'ArcctlPulumi',
  });
};

const startContainer = async (directory?: string): Promise<Deno.ChildProcess> => {
  const command = new Deno.Command('docker', {
    args: [
      'run',
      '--rm',
      '-p',
      '50051:50051',
      '-v',
      '/var/run/docker.sock:/var/run/docker.sock',
      ...(directory ? ['-v', `${directory}:${directory}`] : []),
      'pulumi',
    ],
    stdout: 'piped',
    stderr: 'piped',
  });

  const child = command.spawn();
  // deno-lint-ignore no-async-promise-executor
  return new Promise(async (resolve) => {
    const writable = new WritableStream<Uint8Array>({
      write: async (chunk) => {
        const output = new TextDecoder().decode(chunk);
        if (output.includes('Started server on port')) {
          resolve(child);
        }
      },
    });
    mergeReadableStreams(child.stdout, child.stderr).pipeTo(writable);
  });
};

const stopContainer = async (child: Deno.ChildProcess): Promise<void> => {
  child.kill();
  await child.status;
};

export const Build = async (options: { directory: string }) => {
  const childProcess = await startContainer(options.directory);
  const client = getModuleClient();
  const response = await client.Build(options);
  await stopContainer(childProcess);
  return response;
};

export const Apply = async (
  options: {
    datacenterid: string;
    image: string;
    inputs: Record<string, string>;
    pulumistate?: string;
    destroy?: boolean;
  },
) => {
  const childProcess = await startContainer();
  const client = getModuleClient();
  const response = await client.Apply(options);
  const tmp = {
    ...response,
  };
  delete tmp.pulumistate;
  await stopContainer(childProcess);
  return response;
};
