import { ModuleClient } from './client.ts';
import { Plugin } from './types.ts';

export class ModuleServer {
  private plugin: Plugin;
  private proc?: Deno.ChildProcess;
  private containerName?: string;

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
  async start(directory?: string): Promise<ModuleClient> {
    const pluginImage = `architectio/${this.plugin}-plugin`;
    this.containerName = pluginImage.replace('/', '-') + '-' + Date.now();

    const dev_plugin_port = Deno.env.get('DEV_PLUGIN_PORT');
    if (dev_plugin_port) {
      return new ModuleClient(parseInt(dev_plugin_port));
    }

    const command = new Deno.Command('docker', {
      args: [
        'run',
        '--name',
        this.containerName,
        // '--rm', // TODO: uncomment
        '--pull',
        'missing', // TODO: version the plugins with the CLI to ensure that the right version of the plugin will be pulled if
        '--quiet', // ignore the docker error 'unable to find image <image name> locally if the image needs to be downloaded
        '-p',
        '50051',
        '-v',
        '/var/run/docker.sock:/var/run/docker.sock',
        ...(directory ? ['-v', `${directory}:${directory}`] : []),
        pluginImage,
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
              const port = await this.getPort(this.containerName!);
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
    const dev_plugin_port = Deno.env.get('DEV_PLUGIN_PORT');
    if (dev_plugin_port) {
      return; // dev plugin server was run directly and shouldn't be stopped
    }
    const command = new Deno.Command('docker', {
      args: [
        'stop',
        this.containerName!,
      ],
      stdout: 'piped',
      stderr: 'piped',
    });
    const stopProccess = command.spawn();
    await stopProccess.status;
    await this.proc?.status;
  }
}
