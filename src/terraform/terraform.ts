import * as path from 'std/path/mod.ts';
import { ArchitectPlugin } from '../index.ts';
import PluginManager from '../plugins/plugin-manager.ts';
import { CldCtlTerraformStack } from '../utils/stack.ts';
import { TerraformPlugin, TerraformVersion } from './plugin.ts';

export class Terraform {
  private plugin: ArchitectPlugin;

  constructor(plugin: ArchitectPlugin) {
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
  ): Deno.ChildProcess {
    const moduleFile = path.join(cwd, 'main.tf.json');
    Deno.mkdirSync(cwd, { recursive: true });
    Deno.writeTextFileSync(moduleFile, JSON.stringify(stack.toTerraform()));

    return this.plugin.exec(['init', '-input=false'], {
      stdout: false,
      commandOptions: {
        cwd,
      },
    });
  }

  public plan(
    cwd: string,
    outputFile: string,
    options?: { refresh?: boolean; destroy?: boolean },
  ): Deno.ChildProcess {
    const args = ['plan', '-input=false', `-out=${outputFile}`];
    if (options?.refresh === false) {
      args.push('-refresh=false');
    }

    if (options?.destroy) {
      args.push('-destroy');
    }

    return this.plugin.exec(args, {
      stdout: false,
      commandOptions: { cwd },
    });
  }

  public apply(
    cwd: string,
    planFile: string,
    options?: { refresh?: boolean; destroy?: boolean },
  ): Deno.ChildProcess {
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
      commandOptions: { cwd },
    });
  }

  public destroy(cwd: string, planFile: string): Deno.ChildProcess {
    return this.plugin.exec(['destroy', planFile], {
      stdout: false,
      commandOptions: { cwd },
    });
  }

  public import(
    cwd: string,
    resourceId: string,
    cloudId: string,
  ): Deno.ChildProcess {
    return this.plugin.exec(['import', resourceId, cloudId], {
      stdout: false,
      commandOptions: { cwd },
    });
  }

  public output(cwd: string, id?: string): Deno.ChildProcess {
    const args = ['output', '-json'];
    if (id) {
      args.push(id);
    }

    return this.plugin.exec(args, { stdout: false, commandOptions: { cwd } });
  }
}
