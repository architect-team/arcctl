import { ProviderCredentials } from '../../src/@providers/credentials.ts';
import { Provider } from '../../src/@providers/provider.ts';
import { SupportedProviders } from '../../src/@providers/supported-providers.ts';
import {
  CldctlTest,
  CldctlTestStack,
  CldctlTestStackOutputs,
} from '../../src/@providers/tests.ts';
import { ResourceOutputs, ResourceType } from '../../src/@resources/index.ts';
import PluginManager from '../../src/plugins/plugin-manager.ts';
import TerraformPlugin from '../../src/plugins/terraform-plugin.ts';
import { CldCtlTerraformStack } from '../../src/utils/stack.ts';
import { App, TerraformOutput } from 'cdktf';
import * as path from 'std/path/mod.ts';
import { Construct } from 'constructs';

let terraformPlugin: TerraformPlugin | undefined;

export interface TestRunnerContext<C extends ProviderCredentials> {
  provider: string;
  name_regex?: string;
  credentials: C;
  keep_test_folders?: boolean;
}

export class TestStackGenerator {
  constructor(private readonly credentials: ProviderCredentials) {}

  private async addResourceToStack(
    stack: CldCtlTerraformStack,
    provider: Provider,
    stacks: CldctlTestStack[],
    ids?: Record<string, string>,
  ): Promise<CldctlTestStackOutputs[]> {
    const result_stacks: CldctlTestStackOutputs[] = [];
    for (const child_stack of stacks) {
      const service = child_stack.serviceType;
      const inputs = child_stack.inputs;
      if (
        !provider.resources[service]?.manage ||
        !provider.resources[service]?.manage?.module
      ) {
        throw new Error(`Unsupported resource type: ${service}`);
      }
      const children = child_stack.children
        ? await this.addResourceToStack(
            stack,
            provider,
            child_stack.children,
            ids,
          )
        : [];
      for (const child of children) {
        (child_stack.inputs as any)[child.serviceType] =
          child.module?.outputs?.id;
      }
      const { module, output: tfOutputs } = stack.addModule(
        (provider.resources[service] as any).manage.module,
        child_stack.serviceType as ResourceType,
        inputs,
      );
      result_stacks.push({
        ...child_stack,
        module,
        children,
        tfOutputs,
        imports: (ids || {})[child_stack.serviceType]
          ? await module.genImports(
              this.credentials,
              (ids || {})[child_stack.serviceType],
            )
          : undefined,
      });
    }
    return result_stacks;
  }

  public async generateStack(
    stack: CldCtlTerraformStack,
    provider: Provider,
    test: CldctlTest<ProviderCredentials>,
    ids?: Record<string, string>,
  ): Promise<CldctlTestStackOutputs[]> {
    provider.configureTerraformProviders(stack as unknown as Construct);
    return this.addResourceToStack(stack, provider, test.stacks, ids);
  }
}

export class TestRunner {
  public createDirectory?: string;
  public deleteDirectory?: string;
  public createOutputStacks: CldctlTestStackOutputs[] = [];
  public destroyOutputStacks: CldctlTestStackOutputs[] = [];
  public ids: Record<string, string> = {};

  public async getOutput<T extends ResourceType>(
    output: TerraformOutput,
  ): Promise<ResourceOutputs[T]> {
    const res = await terraformPlugin?.output(
      this.createDirectory!,
      output.friendlyUniqueId,
    );
    return JSON.parse(res || '{}') as ResourceOutputs[T];
  }

  async generateOutputs(stacks: CldctlTestStackOutputs[]): Promise<void> {
    for (const stack of stacks) {
      if (stack.tfOutputs) {
        stack.outputs = await this.getOutput(stack.tfOutputs!);
        stack.id = stack.outputs!.id;
        this.ids[stack.serviceType] = stack.id;
      }
      if (stack.children) {
        await this.generateOutputs(stack.children);
      }
    }
  }

  async runImports(stacks: CldctlTestStackOutputs[]): Promise<void> {
    for (const stack of stacks) {
      if (stack.imports) {
        for (const [key, value] of Object.entries(stack.imports)) {
          await terraformPlugin?.import(this.deleteDirectory!, key, value);
        }
      }
      if (stack.children) {
        await this.runImports(stack.children);
      }
    }
  }

  async create(
    provider: Provider,
    test: CldctlTest<ProviderCredentials>,
    credentials: ProviderCredentials,
  ): Promise<void> {
    const tmp_dir = Deno.makeTempDirSync();
    const tf_tmp_dir = path.join(tmp_dir, `/tf/${crypto.randomUUID()}`);
    this.createDirectory = tf_tmp_dir;
    await Deno.mkdir(tf_tmp_dir, { recursive: true });

    const app = new App({
      outdir: tf_tmp_dir,
    });
    const stack = new CldCtlTerraformStack(app, 'cldctl');

    const test_stack_generator = new TestStackGenerator(credentials);
    this.createOutputStacks = await test_stack_generator.generateStack(
      stack,
      provider,
      test,
    );

    const tfMainFile = path.join(tf_tmp_dir, 'main.tf.json');
    await Deno.mkdir(tf_tmp_dir, { recursive: true });
    await Deno.writeTextFile(tfMainFile, JSON.stringify(stack.toTerraform()));
    await terraformPlugin?.init(tf_tmp_dir);
    const planFile = path.join(tf_tmp_dir, 'plan');
    await terraformPlugin?.plan(tf_tmp_dir, planFile);
    await terraformPlugin?.apply(tf_tmp_dir, planFile);
    await this.generateOutputs(this.createOutputStacks);
  }

  async destroy(
    provider: Provider,
    test: CldctlTest<ProviderCredentials>,
    credentials: ProviderCredentials,
  ): Promise<void> {
    const tmp_dir = Deno.makeTempDirSync();
    const tf_tmp_dir = path.join(tmp_dir, `/tf/${crypto.randomUUID()}`);
    this.deleteDirectory = tf_tmp_dir;
    await Deno.mkdir(tf_tmp_dir, { recursive: true });

    const app = new App({
      outdir: tf_tmp_dir,
    });
    const stack = new CldCtlTerraformStack(app, 'cldctl');

    const test_stack_generator = new TestStackGenerator(credentials);
    this.destroyOutputStacks = await test_stack_generator.generateStack(
      stack,
      provider,
      test,
      this.ids,
    );

    const tfMainFile = path.join(tf_tmp_dir, 'main.tf.json');
    await Deno.mkdir(tf_tmp_dir, { recursive: true });
    await Deno.writeTextFile(tfMainFile, JSON.stringify(stack.toTerraform()));
    await terraformPlugin?.init(tf_tmp_dir);
    await this.runImports(this.destroyOutputStacks);

    await terraformPlugin?.destroy(tf_tmp_dir);
  }

  public async runTests(contexts: TestRunnerContext<any>[]): Promise<void> {
    const supported_providers_keys = Object.keys(SupportedProviders);
    for (const context of contexts) {
      if (!supported_providers_keys.includes(context.provider)) {
        throw new Error(`Unsupported provider: ${context.provider}`);
      }
      const name_regex = context.name_regex
        ? new RegExp(context.name_regex)
        : undefined;
      console.log(`Running tests for ${context.provider}...`);
      const provider_module = await import(
        `../../src/@providers/${context.provider}/provider.js`
      );
      const provider: Provider = new provider_module.default(
        context.provider,
        context.credentials,
      );
      const plugins_path = path.join(Deno.makeTempDirSync(), '/plugins');
      await Deno.mkdir(plugins_path, { recursive: true });
      terraformPlugin = await PluginManager.getPlugin<TerraformPlugin>(
        plugins_path,
        provider.terraform_version,
        TerraformPlugin,
      );
      for (const test of provider.tests) {
        if (name_regex && !name_regex.test(test.name)) {
          continue;
        }
        console.log(`  Running test ${test.name}...`);
        try {
          console.log('    Creating resources...');
          await this.create(provider, test, context.credentials);
          if (test.validateCreate) {
            await test.validateCreate({
              credentials: context.credentials,
              stacks: this.createOutputStacks,
            });
          }
          console.log('    Destroying resources...');
          await this.destroy(provider, test, context.credentials);
          if (test.validateDelete) {
            await test.validateDelete({
              credentials: context.credentials,
              stacks: this.destroyOutputStacks,
            });
          }

          if (context.keep_test_folders) {
            console.log(`    Creating Directory ${this.createDirectory}...`);
            console.log(`    Deleting Directory ${this.deleteDirectory}...`);
          }
          console.log('    Done.');
        } catch (error) {
          if (this.createDirectory) {
            await terraformPlugin?.destroy(this.createDirectory);
          }
          throw error;
        } finally {
          if (!context.keep_test_folders) {
            if (this.createDirectory) {
              await Deno.remove(this.createDirectory, {
                recursive: true,
              });
              console.log(
                `    Removed Create Directory ${this.createDirectory}...`,
              );
            }
            if (this.deleteDirectory) {
              await Deno.remove(this.deleteDirectory, {
                recursive: true,
              });
              console.log(
                `    Removed Delete Directory ${this.deleteDirectory}...`,
              );
            }
          }
        }
      }
    }
  }
}

const configuration_file_path = Deno.args[2];
if (!configuration_file_path) {
  throw new Error('No configuration file provided');
}

const configuration_file = Deno.readTextFileSync(configuration_file_path);
const configuration = JSON.parse(
  configuration_file,
) as TestRunnerContext<any>[];
new TestRunner().runTests(configuration);
