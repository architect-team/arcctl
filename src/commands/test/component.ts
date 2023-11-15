import * as path from 'std/path/mod.ts';
import { Component, parseComponent } from '../../components/index.ts';
import { pathExistsSync } from '../../utils/filesystem.ts';
import { BaseCommand, CommandHelper, GlobalOptions } from '../base-command.ts';

type TestComponentOptions = GlobalOptions;

export const TestComponentCommand = BaseCommand()
  .alias('comp')
  .alias('c')
  .alias('components')
  .description('Test a component configuration by observing the graph generated for specific components')
  .arguments('<tag_or_path:string>')
  .action(async (options: TestComponentOptions, tag_or_path: string) => {
    const command_helper = new CommandHelper(options);

    let component: Component | undefined;
    if (pathExistsSync(tag_or_path)) {
      component = await parseComponent(path.join(Deno.cwd(), tag_or_path));
    } else {
      component = await command_helper.componentStore.getComponentConfig(tag_or_path);
    }

    if (!component) {
      console.error(`Could not find component: ${tag_or_path}`);
      Deno.exit(1);
    }

    const graph = component.getGraph({
      component: {
        name: 'component',
        source: tag_or_path,
      },
      environment: 'environment',
    });

    console.log(graph);
  });
