import { BaseCommand } from '../base-command.ts';
import ComponentBuildCommand from './component.ts';
import DatacenterBuildCommand from './datacenter.ts';
import ModuleBuildCommand from './module.ts';

const BuildCommands = BaseCommand()
  .name('build')
  .description('Build a Component, Datacenter, or Module into an OCI image');

BuildCommands.command('component', ComponentBuildCommand.alias('components').alias('comp'));
BuildCommands.command('datacenter', DatacenterBuildCommand.alias('datacenters').alias('dcs').alias('dc'));
BuildCommands.command('module', ModuleBuildCommand.alias('modules').alias('mod').alias('mods'));

export default BuildCommands;
