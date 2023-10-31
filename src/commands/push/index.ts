import { BaseCommand } from '../base-command.ts';
import ComponentPushCommand from './component.ts';
import DatacenterPushCommand from './datacenter.ts';

const PushCommands = BaseCommand()
  .name('push')
  .description('Push a Component or Datacenter to a remote registry');

PushCommands.command('component', ComponentPushCommand.alias('components').alias('comp'));
PushCommands.command('datacenter', DatacenterPushCommand.alias('datacenters').alias('dcs').alias('dc'));

export default PushCommands;
