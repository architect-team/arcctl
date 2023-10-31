import { BaseCommand } from '../base-command.ts';
import { TestDatacenterCommand } from './datacenter.ts';

const TestCommands = BaseCommand()
  .name('test')
  .description('Test a configuration file');

TestCommands.command('datacenter', TestDatacenterCommand);

export default TestCommands;
