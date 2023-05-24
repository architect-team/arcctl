import PluginManager from '../plugins/plugin-manager.ts';
import { CldCtlTerraformStack } from '../utils/stack.ts';
import { TerraformPlugin, TerraformVersion } from './plugin.ts';
import { ExecaChildProcess } from 'execa';
import fs from 'fs';
import path from 'path';

export class Terraform {
  private plugin: TerraformPlugin;

  constructor(plugin: TerraformPlugin) {
    this.plugin = plugin;
  }

  public static async generate(
    pluginDir: string,
    version: TerraformVersion,
  ): Promise<Terraform> {
    const plugin = await PluginManager.getPlugin(
      pluginDir,
      version,
      TerraformPlugin,
    );

    return new Terraform(plugin);
  }

  public init(
    cwd: string,
    stack: CldCtlTerraformStack,
  ): ExecaChildProcess<string> {
    const moduleFile = path.join(cwd, 'main.tf.json');
    fs.mkdirSync(cwd, { recursive: true });
    fs.writeFileSync(moduleFile, JSON.stringify(stack.toTerraform()));

    return this.plugin.exec(['init', '-input=false'], {
      stdout: false,
      execaOptions: {
        cwd,
      },
    });
  }

  public plan(
    cwd: string,
    outputFile: string,
    options?: { refresh?: boolean; destroy?: boolean },
  ): ExecaChildProcess<string> {
    const args = ['plan', '-input=false', `-out=${outputFile}`];
    if (options?.refresh === false) {
      args.push('-refresh=false');
    }

    if (options?.destroy) {
      args.push('-destroy');
    }

    return this.plugin.exec(args, {
      stdout: false,
      execaOptions: { cwd },
    });
  }

  public apply(
    cwd: string,
    planFile: string,
    options?: { refresh?: boolean; destroy?: boolean },
  ): ExecaChildProcess<string> {
    const args = ['apply'];
    if (options?.refresh === false) {
      args.push('-refresh=false');
    }

    if (options?.destroy) {
      args.push('-destroy');
    }

    args.push(planFile);

    return this.plugin.exec(args, {
      stdout: false,
      execaOptions: { cwd },
    });
  }

  public destroy(cwd: string, planFile: string): ExecaChildProcess<string> {
    return this.plugin.exec(['destroy', planFile], {
      stdout: false,
      execaOptions: { cwd },
    });
  }

  public import(
    cwd: string,
    resourceId: string,
    cloudId: string,
  ): ExecaChildProcess<string> {
    return this.plugin.exec(['import', resourceId, cloudId], {
      stdout: false,
      execaOptions: { cwd },
    });
  }

  public output(cwd: string, id?: string): ExecaChildProcess<string> {
    const args = ['output', '-json'];
    if (id) {
      args.push(id);
    }

    return this.plugin.exec(args, { stdout: false, execaOptions: { cwd } });
  }
}
