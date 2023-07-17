import { rgb24 } from 'https://deno.land/std@0.191.0/fmt/colors.ts';
import { TextLineStream } from 'https://deno.land/std@0.191.0/streams/mod.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from './base-command.ts';

type LogsOptions = {
  follow?: boolean;
  tail?: number;
} & GlobalOptions;

export const streamLogs = async (options: LogsOptions, environment: string): Promise<void> => {
  const command_helper = new CommandHelper(options);
  const environmentRecord = await command_helper.environmentStore.get(environment);
  if (!environmentRecord) {
    console.error(`No environment named ${environment}`);
    Deno.exit(1);
  }

  const pipeline = environmentRecord.lastPipeline;
  const activeSteps = pipeline.steps.filter((step) =>
    step.type !== 'arcctlAccount' &&
    step.action !== 'delete' && step.status.state === 'complete' && step.inputs?.account && step.outputs
  );

  let maxIdLength = 0;
  const streams: Record<string, {
    stream: ReadableStream<Uint8Array>;
    color: { r: number; g: number; b: number };
  }> = {};

  for (const step of activeSteps) {
    const account = await command_helper.providerStore.get(step.inputs!.account!);
    if (!account) {
      console.error(`The ${step.id} resource is using an invalid account: ${step.inputs!.account}`);
      Deno.exit(1);
    }

    const service = account.resources[step.type];
    if (!service) {
      console.error(`The ${account.type} provider doesn't support ${step.type} resources`);
      Deno.exit(1);
    }

    const stream = service.logs(step.outputs!.id, options);
    if (stream) {
      maxIdLength = Math.max(maxIdLength, step.id.length);
      streams[step.id] = {
        stream,
        color: {
          r: Math.floor(Math.random() * 206) + 50,
          g: Math.floor(Math.random() * 156) + 100,
          b: Math.floor(Math.random() * 106) + 150,
        },
      };
    }
  }

  for (const [step_id, config] of Object.entries(streams)) {
    const step = activeSteps.find((step) => step.id === step_id);
    if (!step) {
      console.error(`Couldn't find pipeline step with ID: ${step_id}`);
      Deno.exit(1);
    }

    const account = await command_helper.providerStore.get(step.inputs!.account!);
    if (!account) {
      console.error(`The ${step.id} resource is using an invalid account: ${step.inputs!.account}`);
      Deno.exit(1);
    }
    if (!(await account.testCredentials())) {
      throw new Error(`Unable to get logs for ${account.name} because the credentials are invalid`);
    }

    const service = account.resources[step.type];
    if (!service) {
      console.error(`The ${account.type} provider doesn't support ${step.type} resources`);
      Deno.exit(1);
    }

    config.stream.pipeThrough(new TextDecoderStream()).pipeThrough(new TextLineStream())
      .pipeTo(
        new WritableStream({
          write: (chunk: string) => {
            const extraSpaces = maxIdLength - step.id.length + 1;
            console.log(rgb24(step.id + new Array(extraSpaces).join(' ') + ' | ', config.color) + chunk);
          },
        }),
      );
  }
};

export default BaseCommand()
  .description('Stream logs from running cloud resources in an environment')
  .arguments('<environment:string>')
  .option('-f, --follow [follow:boolean]', 'Whether or not to continuously follow the logs', { default: false })
  .option('-n, --tail <tail:number>', 'Number of lines to show from the end of the logs')
  .action(streamLogs);
