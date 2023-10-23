import { Logger } from 'winston';
import { ApplyOptions, ApplyRequest, ApplyResponse, BuildOptions, BuildRequest, BuildResponse } from './types.ts';

export class ModuleClient {
  socket: WebSocket;

  constructor(port: number) {
    this.socket = new WebSocket(`ws://localhost:${port}/ws`);
  }

  private request<R extends BuildRequest | ApplyRequest>(
    command: string,
    request: R,
    verbose: boolean,
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
    const verbose = Boolean(options && options.verbose);
    return this.request('build', buildRequest, verbose) as Promise<BuildResponse>;
  }

  public async apply(applyRequest: ApplyRequest, options?: ApplyOptions): Promise<ApplyResponse> {
    return this.request('apply', applyRequest, false, options?.logger) as Promise<ApplyResponse>;
  }

  public close() {
    this.socket.close(1000);
  }
}
