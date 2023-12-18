import { Buffer } from 'std/io/buffer.ts';
import { exec, ExecOutput } from './command.ts';

export const getImageLabels = async (tag_or_digest: string): Promise<Record<string, string>> => {
  const { code, stdout, stderr } = await exec('docker', {
    args: ['inspect', '-f', 'json', tag_or_digest],
  });

  if (code !== 0) {
    throw new Error(stderr);
  }

  const results = JSON.parse(stdout);
  if (results.length === 0) {
    throw new Error(`No image found for ${tag_or_digest}`);
  }

  return results[0].Config.Labels || {};
};

/**
 * Execute the specified command
 */
export const execCommands = async (
  image: string,
  environment: Record<string, string>,
  volumes: { host_path: string; mount_path: string }[],
  commands: string[],
): Promise<ExecOutput> => {
  const args = ['run', '-i'];
  Object.values(volumes).forEach((value) => {
    args.push('-v', `${value.host_path}:${value.mount_path}`);
  });
  Object.entries(environment).forEach(([key, value]) => {
    args.push('-e', `${key}=${value}`);
  });
  args.push(image, 'sh');

  const cmd = new Deno.Command('docker', {
    args,
    stdin: 'piped',
    stdout: 'piped',
    stderr: 'piped',
  });

  const proc = cmd.spawn();
  const stdout = new Buffer();
  const stderr = new Buffer();

  proc.stdout.pipeTo(
    new WritableStream({
      write(chunk) {
        stdout.writeSync(chunk);
      },
    }),
  );

  proc.stderr.pipeTo(
    new WritableStream({
      write(chunk) {
        stderr.writeSync(chunk);
      },
    }),
  );

  const writer = proc.stdin.getWriter();
  const encoder = new TextEncoder();
  for (const command of commands) {
    await writer.write(encoder.encode(`${command}\n`));
  }

  await writer.write(encoder.encode('exit'));

  writer.releaseLock();
  proc.stdin.close();
  const status = await proc.status;

  return {
    code: status.code,
    stdout: new TextDecoder().decode(stdout.bytes()),
    stderr: new TextDecoder().decode(stderr.bytes()),
  };
};
