import cliSpinners from 'cli-spinners';
import { Logger } from 'winston';
import { DatacenterRecord } from '../../datacenters/index.ts';
import { Environment, parseEnvironment } from '../../environments/index.ts';
import { InfraGraph, PlanContext } from '../../graphs/index.ts';
import { CommandHelper } from '../base-command.ts';
import { Inputs } from '../common/inputs.ts';

export type ApplyEnvironmentOptions = {
  command_helper: CommandHelper;
  name: string;
  targetEnvironment?: Environment;
  datacenter?: string;
  logger?: Logger;
  autoApprove?: boolean;
  debug?: boolean;
};

export const promptForDatacenter = async (command_helper: CommandHelper, name?: string): Promise<DatacenterRecord> => {
  const datacenterRecords = await command_helper.datacenterStore.find();
  if (datacenterRecords.length <= 0) {
    console.error('No datacenters to create environments in');
    Deno.exit(1);
  }

  let selected = datacenterRecords.find((d) => d.name === name);
  if (!selected) {
    const datacenter = await Inputs.promptSelection({
      message: 'Select a datacenter to host the environment',
      options: datacenterRecords.map((r) => ({
        name: r.name,
        value: r.name,
      })),
    });
    selected = datacenterRecords.find((d) => d.name === datacenter);

    if (!selected) {
      console.log(`Unable to find datacenter: ${datacenter}`);
      Deno.exit(1);
    }
  }

  return selected;
};

export const applyEnvironment = async (options: ApplyEnvironmentOptions) => {
  const environmentRecord = await options.command_helper.environmentStore.get(options.name);
  const notHasDatacenter = !options.datacenter && !environmentRecord;

  const targetDatacenterName = notHasDatacenter
    ? (await promptForDatacenter(options.command_helper, options.datacenter)).name
    : options.datacenter || environmentRecord?.datacenter;
  const targetDatacenter = targetDatacenterName
    ? await options.command_helper.datacenterStore.get(targetDatacenterName)
    : undefined;
  if (!targetDatacenter) {
    console.error(`Couldn't find a datacenter named ${targetDatacenterName}`);
    Deno.exit(1);
  }

  const targetEnvironment = options.targetEnvironment || await parseEnvironment({});

  const environmentGraph = await targetEnvironment.getGraph(
    options.name,
    options.command_helper.componentStore,
    options.debug,
  );

  const targetGraph = targetDatacenter.config.getGraph(environmentGraph, {
    environmentName: options.name,
    datacenterName: targetDatacenter.name,
  });
  targetGraph.validate();

  const startingDatacenter = (await options.command_helper.datacenterStore.get(targetDatacenterName!))!;
  startingDatacenter.config.getGraph(environmentGraph, {
    environmentName: options.name,
    datacenterName: targetDatacenter.name,
  });

  const startingGraph = environmentRecord ? environmentRecord.priorState : targetDatacenter.priorState;

  const infraGraph = await InfraGraph.plan({
    before: startingGraph,
    after: targetGraph,
    context: PlanContext.Environment,
  });

  infraGraph.validate();
  await options.command_helper.infraRenderer.confirmGraph(infraGraph, options.autoApprove);

  let interval: number | undefined = undefined;
  if (!options.logger) {
    interval = setInterval(() => {
      options.command_helper.infraRenderer.renderGraph(infraGraph, { clear: true });
    }, 1000 / cliSpinners.dots.frames.length);
  }

  const success = await options.command_helper.environmentUtils.applyEnvironment(
    options.name,
    startingDatacenter,
    targetEnvironment!,
    infraGraph,
    {
      logger: options.logger,
    },
  );

  if (interval) {
    clearInterval(interval);
  }
  options.command_helper.infraRenderer.renderGraph(infraGraph, { clear: !options.logger, disableSpinner: true });
  options.command_helper.infraRenderer.doneRenderingGraph();

  if (!success) {
    console.log(`Environment ${environmentRecord ? 'update' : 'creation'} failed`);
  } else {
    console.log(`Environment ${options.name} ${environmentRecord ? 'updated' : 'created'} successfully`);
  }
};
