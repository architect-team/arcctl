import { rgb24 } from 'https://deno.land/std@0.191.0/fmt/colors.ts';
import { TextLineStream } from 'https://deno.land/std@0.191.0/streams/mod.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from './base-command.ts';

type LogsOptions = {
  follow?: boolean;
  tail?: number;
} & GlobalOptions;

const LogsCommand = BaseCommand()
  .description('Stream logs from running cloud resources in an environment')
  .arguments('<environment:string>')
  .option('-f, --follow [follow:boolean]', 'Whether or not to continuously follow the logs', { default: false })
  .option('-n, --tail <tail:number>', 'Number of lines to show from the end of the logs')
  .action(logs_action);

async function logs_action(options: LogsOptions, environment: string): Promise<void> {
  const command_helper = new CommandHelper(options);
  const environmentRecord = await command_helper.environmentStore.get(environment);
  if (!environmentRecord) {
    console.error(`No environment named ${environment}`);
    Deno.exit(1);
  }

  const datacenterRecord = await command_helper.datacenterStore.get(environmentRecord.datacenter);
  if (!datacenterRecord) {
    console.error(`No datacenter named ${environmentRecord.datacenter}`);
    Deno.exit(1);
  }

  const pipeline = await command_helper.getPipelineForDatacenter(datacenterRecord);
  const activeSteps = pipeline.steps.filter((step) =>
    step.type !== 'arcctlAccount' &&
    step.action !== 'delete' && step.status.state === 'complete' && step.inputs?.account && step.outputs
  );

  let maxIdLength = 0;
  const colors: Record<string, { r: number; g: number; b: number }> = {};
  for (const step of activeSteps) {
    maxIdLength = Math.max(maxIdLength, step.id.length);
    colors[step.id] = {
      r: Math.floor(Math.random() * 156) + 100,
      g: Math.floor(Math.random() * 156) + 100,
      b: Math.floor(Math.random() * 156) + 100,
    };
  }

  for (const step of activeSteps) {
    const account = command_helper.providerStore.getProvider(step.inputs!.account!);
    if (!account) {
      console.error(`The ${step.id} resource is using an invalid account: ${step.inputs!.account}`);
      Deno.exit(1);
    }

    const service = account.resources[step.type];
    if (!service) {
      console.error(`The ${account.type} provider doesn't support ${step.type} resources`);
      Deno.exit(1);
    }

    service.logs(step.outputs!.id, options).pipeThrough(new TextDecoderStream()).pipeThrough(new TextLineStream())
      .pipeTo(
        new WritableStream({
          write: (chunk: string) => {
            const extraSpaces = maxIdLength - step.id.length;
            console.log(rgb24(step.id + new Array(extraSpaces).join(' ') + ' | ' + chunk, colors[step.id]));
          },
        }),
      );
  }
}

export default LogsCommand;
