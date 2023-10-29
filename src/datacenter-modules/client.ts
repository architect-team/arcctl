import * as path from 'std/path/mod.ts';
import { Logger } from 'winston';
import { ApplyOptions, ApplyRequest, ApplyResponse, BuildOptions, BuildRequest, BuildResponse } from './types.ts';

export class ModuleClient {
  private socket: WebSocket;
  private stateFilePath: string;

  constructor(port: number, stateFileDir: string) {
    this.socket = new WebSocket(`ws://localhost:${port}/ws`);
    this.stateFilePath = path.join(stateFileDir, 'statefile.txt');
  }

  private request<R extends BuildRequest | ApplyRequest>(
    command: string,
    request: R,
    logger?: Logger,
  ): Promise<R extends BuildRequest ? BuildResponse : ApplyResponse> {
    return new Promise((resolve, reject) => {
      this.socket.addEventListener('open', () => {
        this.socket.send(JSON.stringify({
          command,
          request,
        }));
      });

      this.socket.addEventListener('message', (event) => {
        try {
          const evt = JSON.parse(event.data);
          if (evt.verboseOutput) {
            if (logger) {
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

      this.socket.addEventListener('error', async (event) => {
        // Likely couldn't connect to plugin server
        if (event instanceof ErrorEvent) {
          return reject(event.message);
        }
        reject(event);
      });
    });
  }

  public async build(buildRequest: BuildRequest, options?: BuildOptions): Promise<BuildResponse> {
    return this.request('build', buildRequest, options?.logger) as Promise<BuildResponse>;
  }

  public async apply(applyRequest: ApplyRequest, options?: ApplyOptions): Promise<ApplyResponse> {
    // Write the state to the mounted path
    if (applyRequest.state) {
      Deno.writeTextFileSync(this.stateFilePath, applyRequest.state);
      // Replace state with the path to the state
      applyRequest.state = this.stateFilePath;
    }
    return this.request('apply', applyRequest, options?.logger) as Promise<ApplyResponse>;
  }

  public close() {
    this.socket.close(1000);
  }
}
