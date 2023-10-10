import { Plugin } from '../types.ts';
import { ModuleClient } from './client.ts';

export class ModuleServer {
  private plugin: Plugin;
  private proc?: Deno.ChildProcess;

  constructor(plugin: Plugin) {
    this.plugin = plugin;
  }

  private async getPort(containerName: string): Promise<number> {
    const getPortCmd = new Deno.Command('docker', { args: ['port', containerName] });
    const { stdout: outputChunk } = await getPortCmd.output();
    const portOutput = new TextDecoder().decode(outputChunk);
    const portMatches = portOutput.match(/-> 0\.0\.0\.0:([0-9]{1,5})/);
    if (!portMatches) {
      throw new Error('Failed to get port from container');
    }

    return parseInt(portMatches[1]);
  }

  /**
   * Start the websocket server for the plugin type and return the port its available on
   */
  start(directory?: string): Promise<ModuleClient> {
    const pluginBinary = `arcctl-${this.plugin}-plugin`;
    const command = new Deno.Command('docker', {
      args: [
        'run',
        '--name',
        pluginBinary,
        '--rm',
        '-p',
        '50051:50051',
        '-v',
        '/var/run/docker.sock:/var/run/docker.sock',
        ...(directory ? ['-v', `${directory}:${directory}`] : []),
        pluginBinary,
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
              const port = await this.getPort(pluginBinary);
              this.proc = process;
              resolve(new ModuleClient(port));
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
  }

  async stop(): Promise<void> {
    this.proc?.kill();
    await this.proc?.status;
  }
}
