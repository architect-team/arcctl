import { ModuleClient } from './client.ts';
import { Plugin } from './types.ts';

export class ModuleServer {
  private plugin: Plugin;
  private proc?: Deno.ChildProcess;
  private containerName?: string;
  private dev_pulumi_plugin_port?: string;
  private dev_opentofu_plugin_port?: string;
  private dev_state_dir?: string;

  constructor(plugin: Plugin) {
    this.plugin = plugin;
    this.dev_pulumi_plugin_port = Deno.env.get('DEV_PULUMI_PLUGIN_PORT');
    this.dev_opentofu_plugin_port = Deno.env.get('DEV_OPENTOFU_PLUGIN_PORT');
    // This should be set to whatever directory is used in the first half of `-v /path/to/state/dir:/state`
    // which should be set when running the plugin manually, e.g. DEV_STATE_DIR="/path/to/state/dir".
    // The statefile for each pipeline step will be written to this directory.
    this.dev_state_dir = Deno.env.get('DEV_STATE_DIR');
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

    if (this.dev_pulumi_plugin_port || this.dev_opentofu_plugin_port) {
      if (!this.dev_state_dir) {
        throw Error('DEV_STATE_DIR must be set when using dev mode.');
      }
      if (this.dev_pulumi_plugin_port && this.plugin === 'pulumi') {
        return new ModuleClient(parseInt(this.dev_pulumi_plugin_port), this.dev_state_dir);
      } else if (this.dev_opentofu_plugin_port && this.plugin === 'opentofu') {
        return new ModuleClient(parseInt(this.dev_opentofu_plugin_port), this.dev_state_dir);
      }
    }

    const stateFileDir = Deno.makeTempDirSync({ prefix: 'state' });
    const command = new Deno.Command('docker', {
      args: [
        'run',
        '--name',
        this.containerName,
        // '--rm',
        '--pull',
        'missing', // TODO: version the plugins with the CLI to ensure that the right version of the plugin will be pulled if
        '--quiet', // ignore the docker error 'unable to find image <image name> locally if the image needs to be downloaded
        '-p',
        '50051',
        // Allows mounting from the host to the Docker-In-Docker container
        '-v',
        '/var/run/docker.sock:/var/run/docker.sock',
        // Creates a volume that can be used to pass the input state or various other data to the DinD container
        '-v',
        `${stateFileDir}:/state`,
        // Mounts the volume for the module itself
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
              resolve(new ModuleClient(port, stateFileDir));
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
    if (this.dev_pulumi_plugin_port || this.dev_opentofu_plugin_port) {
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
