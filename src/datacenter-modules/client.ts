import { Logger } from 'winston';
import { ApplyOptions, ApplyRequest, ApplyResponse, BuildOptions, BuildRequest, BuildResponse } from './types.ts';

export class ModuleClient {
  port: number;

  constructor(port: number) {
    this.port = port;
  }

  private request<R extends BuildRequest | ApplyRequest>(
    command: string,
    request: R,
    verbose: boolean,
    logger?: Logger,
  ): Promise<R extends BuildRequest ? BuildResponse : ApplyResponse> {
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(`ws://localhost:${this.port}/ws`);
      socket.addEventListener('open', () => {
        socket.send(JSON.stringify({
          command,
          request,
        }));
      });

      socket.addEventListener('message', (event) => {
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
    });
  }

  public async build(buildRequest: BuildRequest, options?: BuildOptions): Promise<BuildResponse> {
    const verbose = Boolean(options && options.verbose);
    return this.request('build', buildRequest, verbose) as Promise<BuildResponse>;
  }

  public async apply(applyRequest: ApplyRequest, options?: ApplyOptions): Promise<ApplyResponse> {
    return this.request('apply', applyRequest, false, options?.logger) as Promise<ApplyResponse>;
  }
}
