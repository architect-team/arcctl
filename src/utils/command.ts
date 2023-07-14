import { Buffer } from 'std/io/buffer.ts';

export type ExecOutput = {
  code: number;
  stdout: string;
  stderr: string;
};

export async function exec(command: string, command_options: Deno.CommandOptions): Promise<ExecOutput> {
  const cmd = new Deno.Command(command, {
    ...command_options,
    stdout: 'piped',
    stderr: 'piped',
  });

  const { code, stdout, stderr } = await cmd.output();
  return {
    code,
    stdout: new TextDecoder().decode(stdout),
    stderr: new TextDecoder().decode(stderr),
  };
}

/**
 * Execs the command and pipes stdout and stderr to Deno.stdout and Deno.stderr
 * Returns the status code of the command.
 */
export async function execVerbose(command: string, command_options: Deno.CommandOptions): Promise<ExecOutput> {
  const cmd = new Deno.Command(command, {
    ...command_options,
    stdout: 'piped',
    stderr: 'piped',
  });

  const stdout = new Buffer();
  const stderr = new Buffer();

  const child = cmd.spawn();

  child.stdout.pipeTo(
    new WritableStream({
      write(chunk) {
        stdout.writeSync(chunk);
        Deno.stdout.writeSync(chunk);
      },
    }),
  );

  child.stderr.pipeTo(
    new WritableStream({
      write(chunk) {
        stderr.writeSync(chunk);
        Deno.stderr.writeSync(chunk);
      },
    }),
  );

  const status = await child.status;

  return {
    code: status.code,
    stdout: new TextDecoder().decode(stdout.bytes()),
    stderr: new TextDecoder().decode(stderr.bytes()),
  };
}
