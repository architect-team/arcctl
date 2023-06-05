type ExecOutput = {
  stdout: string;
  stderr: string;
};

export async function exec(command: string, command_options: Deno.CommandOptions): Promise<ExecOutput> {
  const cmd = new Deno.Command(command, {
    ...command_options,
    stdout: 'piped',
    stderr: 'piped',
  });

  const { stdout, stderr } = await cmd.output();
  return {
    stdout: new TextDecoder().decode(stdout),
    stderr: new TextDecoder().decode(stderr),
  };
}
