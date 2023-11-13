import { BaseCommand } from '../base-command.ts';
import { TestComponentCommand } from './component.ts';
import { TestDatacenterCommand } from './datacenter.ts';

const TestCommands = BaseCommand()
  .name('test')
  .description('Test a configuration file');

TestCommands.command('datacenter', TestDatacenterCommand);
TestCommands.command('component', TestComponentCommand);

export default TestCommands;
