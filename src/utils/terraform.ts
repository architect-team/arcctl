import { ProviderCredentials } from '../@providers/credentials.ts';
import { ResourceModule } from '../@providers/module.ts';
import { ResourceStatus } from '../@providers/status.ts';
import { ResourceOutputs, ResourceType } from '../@resources/index.ts';
import PluginManager from '../plugins/plugin-manager.ts';
import TerraformPlugin, {
  TerraformVersion,
} from '../plugins/terraform-plugin.ts';
import CloudCtlConfig from './config.ts';
import { getLogger } from './logger.ts';
import { CldCtlTerraformStack } from './stack.ts';
import { TerraformOutput } from 'cdktf';
import { ExecaChildProcess } from 'execa';
import { Buffer } from 'https://deno.land/std@0.177.0/node/internal/buffer.mjs';
import { BehaviorSubject } from 'rxjs';
import * as path from 'std/path/mod.ts';

export default class Terraform {
  private static terraformPlugin?: TerraformPlugin;

  static logger = getLogger(Terraform.name);

  private static async ready(version: TerraformVersion) {
    if (!this.terraformPlugin) {
      this.terraformPlugin = await PluginManager.getPlugin<TerraformPlugin>(
        CloudCtlConfig.getPluginDirectory(),
        version,
        TerraformPlugin,
      );
    }
  }

  public static async cleanup(attempts = 0): Promise<void> {
    if (CloudCtlConfig.isNoCleanup()) {
      console.log(
        `Not cleaning up: ${CloudCtlConfig.getTerraformDirectory()}\n\n\n`,
      );
      return;
    }
    if (attempts === 0) {
      this.logger.debug(
        `Cleaning up: ${CloudCtlConfig.getTerraformDirectory()}`,
      );
    }
    try {
      await Deno.remove(CloudCtlConfig.getTerraformDirectory(), {
        recursive: true,
      });
    } catch {
      if (attempts === 10) {
        throw new Error('Unable to properly cleanup folder.');
      } else {
        setTimeout(() => {
          this.cleanup(attempts + 1);
        }, 1000);
      }
    }
  }

  private static async init(stack: CldCtlTerraformStack): Promise<void> {
    this.logger.debug(`Initalzing terraform`);
    const tfDir = CloudCtlConfig.getTerraformDirectory();
    const tfMainFile = path.join(tfDir, 'main.tf.json');
    await this.cleanup();
    await Deno.mkdir(tfDir, { recursive: true });
    await Deno.writeTextFile(tfMainFile, JSON.stringify(stack.toTerraform()));
    await this.terraformPlugin?.init(tfDir);
  }

  public static async plan(
    version: TerraformVersion,
    stack: CldCtlTerraformStack,
  ): Promise<string> {
    if (version === 'fake') {
      return '';
    }
    await this.ready(version);
    const tfDir = CloudCtlConfig.getTerraformDirectory();
    await this.init(stack);
    const planFile = path.join(tfDir, 'plan');
    this.logger.debug(`Running terraform plan`);
    return (await this.terraformPlugin?.plan(tfDir, planFile)) || '';
  }

  private static async handleDisplay(
    cmd: ExecaChildProcess<string>,
    stack: CldCtlTerraformStack,
    onStart: (name: string) => void,
    onEnd: (name: string) => void,
  ): Promise<void> {
    const resourceIdMapping = stack.getResourceDisplayNames();

    const writableStream = new WritableStream<string | Buffer>({
      write(chunk) {
        return new Promise((resolve) => {
          const line = chunk.toString();
          for (const [resourceId, displayName] of Object.entries(
            resourceIdMapping,
          )) {
            if (!line.includes(resourceId)) {
              continue;
            }
            if (
              line.includes('Creating...') ||
              line.includes('Destroying...')
            ) {
              onStart(displayName);
            } else if (
              line.includes('Creation complete after') ||
              line.includes('Destruction complete after')
            ) {
              onEnd(displayName);
            }
          }
          resolve();
        });
      },
    });

    cmd?.stdout?.pipe(writableStream);
    await cmd;
  }

  private static async writeStack(stack: CldCtlTerraformStack) {
    const tfDir = CloudCtlConfig.getTerraformDirectory();
    const tfMainFile = path.join(tfDir, 'main.tf.json');
    await Deno.mkdir(tfDir, { recursive: true });
    await Deno.writeTextFile(tfMainFile, JSON.stringify(stack.toTerraform()));
  }

  public static async upsert(
    version: TerraformVersion,
    stack: CldCtlTerraformStack,
    subject: BehaviorSubject<ResourceStatus | ResourceOutputs[ResourceType]>,
  ): Promise<void> {
    if (version === 'fake') {
      return;
    }
    await this.ready(version);
    await this.plan(version, stack);
    if (CloudCtlConfig.isDev()) {
      console.log('Not running apply since in dev mode');
      console.log();
      return;
    }
    const tfDir = CloudCtlConfig.getTerraformDirectory();
    const planFile = path.join(tfDir, 'plan');
    if (!this.terraformPlugin) {
      throw new Error('Terraform plugin has not been initialized properly');
    }
    const cmd = this.terraformPlugin.apply(tfDir, planFile);
    await this.handleDisplay(
      cmd,
      stack,
      (displayName) => {
        subject.next({
          state: 'creating',
          message: displayName,
        });
      },
      (displayName: string) => {
        subject.next({
          state: 'complete',
          message: displayName,
        });
      },
    );
  }

  public static async getImportRecords(
    version: TerraformVersion,
    stack: CldCtlTerraformStack,
    resources: {
      [T in ResourceType]?: { id: string; credentials: ProviderCredentials };
    },
  ): Promise<Record<string, Record<string, string>>> {
    if (version === 'fake') {
      return {};
    }
    const import_records: Record<string, Record<string, string>> = {};

    const modules = stack.findModules();
    for (const module of modules) {
      const resourceData = resources[module.node.id as ResourceType];
      if (!resourceData) {
        throw new Error(`Missing ID for the ${module.node.id} resource`);
      }

      const imports = await module.genImports(
        resourceData.credentials,
        resourceData.id,
      );

      import_records[module.node.id] = imports;
    }
    return import_records;
  }

  public static async import(
    version: TerraformVersion,
    import_records: Record<string, Record<string, string>>,
  ): Promise<void> {
    if (version === 'fake') {
      return;
    }
    await this.ready(version);

    for (const [_, records] of Object.entries(import_records)) {
      for (const [key, value] of Object.entries(records)) {
        await this.terraformPlugin?.import(
          CloudCtlConfig.getTerraformDirectory(),
          key,
          value,
        );
      }
    }
  }

  public static async destroy<T extends ResourceType>(
    module: ResourceModule<T, ProviderCredentials>,
    version: TerraformVersion,
    stack: CldCtlTerraformStack,
    resourceData: {
      [T in ResourceType]?: { id: string; credentials: ProviderCredentials };
    },
    subject: BehaviorSubject<ResourceOutputs[ResourceType] | ResourceStatus>,
  ): Promise<void> {
    if (version === 'fake') {
      return;
    }
    await this.ready(version);
    const import_records = await this.getImportRecords(
      version,
      stack,
      resourceData,
    );
    await this.writeStack(stack);
    await this.init(stack);
    await this.plan(version, stack);
    await this.import(version, import_records);
    if (module.hooks?.afterImport) {
      await module.hooks.afterImport();
    }

    await this.writeStack(stack);

    if (CloudCtlConfig.isDev()) {
      console.log('Not running destroy since in dev mode');
      console.log();
      return;
    }
    if (!this.terraformPlugin) {
      throw new Error('Terraform plugin has not been initialized properly');
    }
    const cmd = this.terraformPlugin.destroy(
      CloudCtlConfig.getTerraformDirectory(),
    );
    await this.handleDisplay(
      cmd,
      stack,
      (displayName) => {
        subject.next({
          state: 'deleting',
          message: displayName,
        });
      },
      (displayName: string) => {
        this.cleanup().then(() => {
          subject.next({
            state: 'complete',
            message: displayName,
          });
        });
      },
    );
  }

  public static async getOutput<T extends ResourceType>(
    output: TerraformOutput,
  ): Promise<ResourceOutputs[T]> {
    const res = await this.terraformPlugin?.output(
      CloudCtlConfig.getTerraformDirectory(),
      output.friendlyUniqueId,
    );
    return JSON.parse(res || '{}') as ResourceOutputs[T];
  }

  public static async getOutputString(
    output: TerraformOutput,
  ): Promise<string> {
    return (
      (await this.terraformPlugin?.output(
        CloudCtlConfig.getTerraformDirectory(),
        output.friendlyUniqueId,
      )) || ''
    );
  }
}
