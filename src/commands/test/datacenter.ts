import * as path from 'std/path/mod.ts';
import { parseDatacenter } from '../../datacenters/index.ts';
import { parseEnvironment } from '../../environments/index.ts';
import { InfraGraph, PlanContext } from '../../graphs/index.ts';
import { pathExistsSync } from '../../utils/filesystem.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';

type TestDatacenterOptions = GlobalOptions & {
  verbose: boolean;
  var?: string[];
};

export const TestDatacenterCommand = BaseCommand()
  .alias('dc')
  .alias('dcs')
  .alias('datacenters')
  .description('Test a datacenter configuration by observing the graph generated for specific components')
  .arguments('<datacenter_path:string> <environment_path:string>')
  .option('-v, --verbose [verbose:boolean]', 'Verbose output', { default: false })
  .option('--var <var:string>', 'Provide value for a datacenter variable', { collect: true })
  .action(async (options: TestDatacenterOptions, datacenter_path: string, environment_path: string) => {
    if (!pathExistsSync(datacenter_path)) {
      console.log(`Datacenter path does not exist: ${datacenter_path}`);
      Deno.exit(1);
    } else if (!pathExistsSync(environment_path)) {
      console.log(`Environment path does not exist: ${environment_path}`);
      Deno.exit(1);
    }

    const flag_vars: Record<string, string> = {};
    for (const v of options.var || []) {
      const var_option = v.split('=');
      if (var_option.length !== 2) {
        console.log(`Invalid variable argument: '${v}'. Must be formatted: VAR_NAME=VAR_VALUE`);
        Deno.exit(1);
      }
      flag_vars[var_option[0]] = var_option[1];
    }

    const envs = Deno.env.toObject();
    for (const key of Object.keys(envs)) {
      if (key.startsWith('ARC_')) {
        flag_vars[key.replace('ARC_', '')] = envs[key];
      }
    }

    const command_helper = new CommandHelper(options);

    let datacenter = await parseDatacenter(path.resolve(datacenter_path));
    datacenter = await command_helper.datacenterUtils.buildDatacenter(
      datacenter,
      path.resolve(datacenter_path),
      options.verbose,
    );

    const vars = await command_helper.datacenterUtils.promptForVariables(
      datacenter.getVariablesSchema(),
      flag_vars,
    );

    const environment = await parseEnvironment(path.resolve(environment_path));
    const environmentGraph = await environment.getGraph('tmp', command_helper.componentStore);

    const targetGraph = datacenter.getGraph(environmentGraph, {
      datacenterName: 'datacenter',
      environmentName: 'tmp',
      variables: vars,
    });
    targetGraph.validate();

    const plannedGraph = await InfraGraph.plan({
      before: new InfraGraph(),
      after: targetGraph,
      context: PlanContext.Environment,
    });
    plannedGraph.validate();

    console.log(JSON.stringify(plannedGraph, null, 2));
  });
