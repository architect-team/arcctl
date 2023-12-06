import cliSpinners from 'cli-spinners';
import { Logger } from 'winston';
import { DatacenterRecord } from '../../datacenters/index.ts';
import { Environment, parseEnvironment } from '../../environments/index.ts';
import { InfraGraph, PlanContext } from '../../graphs/index.ts';
import ArcctlConfig from '../../utils/config.ts';
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

export const applyEnvironment = async (
  options: ApplyEnvironmentOptions,
): Promise<{ success: boolean; update: boolean }> => {
  const existingEnvironmentRecord = await options.command_helper.environmentStore.get(options.name);
  let datacenterRecord = options.datacenter
    ? await options.command_helper.datacenterStore.get(options.datacenter)
    : existingEnvironmentRecord
    ? await options.command_helper.datacenterStore.get(existingEnvironmentRecord.datacenter)
    : await ArcctlConfig.getDefaultDatacenter(options.command_helper);

  if (!datacenterRecord) {
    datacenterRecord = await promptForDatacenter(options.command_helper);
  }

  if (!datacenterRecord) {
    throw new Error(`No valid datacenter provided`);
  }

  const targetEnvironment = options.targetEnvironment || await parseEnvironment({});
  const targetAppGraph = await targetEnvironment.getGraph(
    options.name,
    options.command_helper.componentStore,
    options.debug,
  );

  const targetInfraGraph = datacenterRecord.config.getGraph(targetAppGraph, {
    environmentName: options.name,
    datacenterName: datacenterRecord.name,
  });
  targetInfraGraph.validate();

  const plannedChanges = await InfraGraph.plan({
    before: existingEnvironmentRecord ? existingEnvironmentRecord.priorState : datacenterRecord.priorState,
    after: targetInfraGraph,
    context: PlanContext.Environment,
  });

  plannedChanges.validate();
  await options.command_helper.infraRenderer.confirmGraph(plannedChanges, options.autoApprove);

  let interval: number | undefined = undefined;
  if (!options.logger) {
    interval = setInterval(() => {
      options.command_helper.infraRenderer.renderGraph(plannedChanges, { clear: true });
    }, 1000 / cliSpinners.dots.frames.length);
  }

  const success = await options.command_helper.environmentUtils.applyEnvironment(
    options.name,
    datacenterRecord,
    targetEnvironment,
    plannedChanges,
    {
      logger: options.logger,
    },
  );

  if (interval) {
    clearInterval(interval);
  }
  options.command_helper.infraRenderer.renderGraph(plannedChanges, { clear: !options.logger, disableSpinner: true });
  options.command_helper.infraRenderer.doneRenderingGraph();

  return {
    success,
    update: !!existingEnvironmentRecord,
  };
};
