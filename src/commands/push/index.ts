import { BaseCommand } from '../base-command.ts';
import ComponentPushCommand from './component.ts';
import DatacenterPushCommand from './datacenter.ts';
import ModulePushCommand from './module.ts';

const PushCommands = BaseCommand()
  .name('push')
  .description('Push a Component or Datacenter to a remote registry');

PushCommands.command('component', ComponentPushCommand.alias('components').alias('comp'));
PushCommands.command('datacenter', DatacenterPushCommand.alias('datacenters').alias('dcs').alias('dc'));
PushCommands.command('module', ModulePushCommand.alias('modules').alias('mod').alias('mods'));

export default PushCommands;
