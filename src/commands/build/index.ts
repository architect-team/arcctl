import { BaseCommand } from '../base-command.ts';
import ComponentBuildCommand from './component.ts';
import DatacenterBuildCommand from './datacenter.ts';

const BuildCommands = BaseCommand();

BuildCommands.command('component', ComponentBuildCommand.alias('components').alias('comp'));
BuildCommands.command('datacenter', DatacenterBuildCommand.alias('datacenters').alias('dcs').alias('dc'));

export default BuildCommands;
