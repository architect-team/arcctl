import {
  Provider,
  SupportedProviders,
  ProviderStore,
} from './@providers/index.js';
import { ResourceType, ResourceTypeList } from './@resources/index.js';
import { CloudEdge, CloudGraph, CloudNode } from './cloud-graph/index.js';
import { ComponentStore } from './component-store/index.js';
import {
  Datacenter,
  DatacenterRecord,
  DatacenterStore,
} from './datacenters/index.js';
import { EnvironmentStore } from './environments/index.js';
import { Pipeline, PipelineStep } from './pipeline/index.js';
import { Terraform } from './terraform/terraform.js';
import CloudCtlConfig from './utils/config.js';
import { CldCtlProviderStore } from './utils/provider-store.js';
import { createProvider } from './utils/providers.js';
import { createTable } from './utils/table.js';
import { Command, Config } from '@oclif/core';
import { JSONSchemaType } from 'ajv';
import chalk from 'chalk';
import cliSpinners from 'cli-spinners';
import deepmerge from 'deepmerge';
import fs from 'fs/promises';
import inquirer from 'inquirer';
import path from 'path';
import readline from 'readline';
import url from 'url';

export abstract class BaseCommand extends Command {
  private spinner_frame_index: number = 0;

  constructor(argv: string[], config: Config) {
    super(argv, config);
    CloudCtlConfig.setOclifConfig(config);
  }

  protected get componentStore(): ComponentStore {
    return new ComponentStore(
      path.join(this.config.configDir, 'component-store'),
      'registry.architect.io',
    );
  }

  protected get providerStore(): ProviderStore {
    return new CldCtlProviderStore(this.config.configDir);
  }

  protected get datacenterStore(): DatacenterStore {
    return new DatacenterStore(this.config.configDir);
  }

  protected get environmentStore(): EnvironmentStore {
    return new EnvironmentStore(this.config.configDir);
  }

  /**
   * Store the pipeline in the datacenters secret manager and then log
   * it to the datacenter store
   */
  protected async saveDatacenter(
    datacenterName: string,
    datacenter: Datacenter,
    pipeline: Pipeline,
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const secretStep = new PipelineStep({
        action: 'create',
        type: 'secret',
        name: `${datacenterName}-datacenter-pipeline`,
        inputs: {
          type: 'secret',
          name: `datacenter-pipeline`,
          namespace: datacenterName,
          account: datacenter.getSecretsConfig().account,
          data: JSON.stringify(pipeline),
        },
      });

      const terraform = await Terraform.generate(
        CloudCtlConfig.getPluginDirectory(),
        '1.4.5',
      );

      secretStep
        .apply({
          providerStore: this.providerStore,
          terraform: terraform,
        })
        .subscribe({
          complete: async () => {
            const outputs = await secretStep.getOutputs({
              providerStore: this.providerStore,
              terraform: terraform,
            });

            if (!outputs) {
              this.error('Something went wrong storing the pipeline');
            }

            await this.datacenterStore.save({
              name: datacenterName,
              config: datacenter,
              lastPipeline: {
                account: datacenter.getSecretsConfig().account,
                secret: outputs.id,
              },
            });
            resolve();
          },
          error: reject,
        });
    });
  }

  protected async removeDatacenter(record: DatacenterRecord): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const secretStep = new PipelineStep({
        action: 'delete',
        type: 'secret',
        name: `${record.name}-datacenter-pipeline`,
        resource: {
          account: record.config.getSecretsConfig().account,
          id: `${record.name}/datacenter-pipeline`,
        },
      });

      const terraform = await Terraform.generate(
        CloudCtlConfig.getPluginDirectory(),
        '1.4.5',
      );

      secretStep
        .apply({
          providerStore: this.providerStore,
          terraform: terraform,
        })
        .subscribe({
          complete: async () => {
            await this.datacenterStore.remove(record.name);
            resolve();
          },
          error: reject,
        });
    });
  }

  protected async getPipelineForDatacenter(
    record: DatacenterRecord,
  ): Promise<Pipeline> {
    const secretAccount = this.providerStore.getProvider(
      record.lastPipeline.account,
    );
    if (!secretAccount) {
      this.error(
        `Invalid account used by datacenter for secrets: ${record.lastPipeline.account}`,
      );
    }

    const service = secretAccount.resources.secret;
    if (!service) {
      this.error(`The ${secretAccount.type} provider doesn't support secrets`);
    }

    const secret = await service.get(record.lastPipeline.secret);
    if (!secret) {
      this.error(
        `Invalid secret housing datacenter pipeline: ${record.lastPipeline.secret}`,
      );
    }

    const rawPipeline = JSON.parse(secret.data);

    return new Pipeline({
      steps: rawPipeline.steps.map((step: any) => new PipelineStep(step)),
      edges: rawPipeline.edges.map((edge: any) => new CloudEdge(edge)),
    });
  }

  /**
   * Render the executable graph and the status of each resource
   */
  protected renderPipeline(
    pipeline: Pipeline,
    options?: { clear?: boolean },
  ): void {
    const headers = ['Name', 'Type'];
    const showEnvironment = pipeline.steps.some((s) => s.environment);
    const showComponent = pipeline.steps.some((s) => s.component);

    if (showComponent) {
      headers.push('Component');
    }

    if (showEnvironment) {
      headers.push('Environment');
    }

    headers.push('Action', 'Status', 'Time');
    const table = createTable({
      head: headers,
    });

    table.push(
      ...pipeline.steps
        .sort(
          (first: PipelineStep, second: PipelineStep) =>
            second.environment?.localeCompare(first.environment || '') ||
            second.component?.localeCompare(first.component || '') ||
            0,
        )
        .map((step: PipelineStep) => {
          const row = [step.name, step.type];

          if (showComponent) {
            row.push(step.component || '');
          }

          if (showEnvironment) {
            row.push(step.environment || '');
          }

          row.push(
            step.action,
            step.status.state,
            Math.floor(
              ((step.status.endTime || Date.now()) -
                (step.status.startTime || Date.now())) /
                1000,
            ) + 's',
            step.status.message || '',
          );

          return row;
        }),
    );

    if (options?.clear) {
      readline.cursorTo(process.stdout, 0, 0);
      readline.clearScreenDown(process.stdout);

      const spinner = cliSpinners.dots.frames[this.spinner_frame_index];
      this.spinner_frame_index =
        ++this.spinner_frame_index % cliSpinners.dots.frames.length;

      this.log(spinner + ' Applying changes');
      this.log('\n' + table.toString());
    } else {
      this.log(table.toString());
    }
  }

  /**
   * Helper method to prompt users to confirm they're ready to proceed
   */
  private async promptForContinuation(message: string): Promise<boolean> {
    const { proceed } = await inquirer.prompt([
      {
        name: 'proceed',
        type: 'confirm',
        message,
        default: false,
      },
    ]);
    return proceed;
  }

  /**
   * Prompts users for array inputs based on a provided json schema
   */
  private async promptForArrayInputs<T = any>(
    graph: CloudGraph,
    provider: Provider,
    property: { name: string; schema: JSONSchemaType<any> },
    existingValues: Record<string, unknown>,
  ): Promise<Array<T>> {
    const results: Array<T> = [];

    const { count } = await inquirer.prompt([
      {
        name: 'count',
        type: 'number',
        message: `How many ${
          property.schema.description || property.name
        } should be created?`,
        validate: (input: number) => {
          if (property.schema.minimum && input < property.schema.minimum) {
            return `${property.name} must be greater than ${property.schema.minimum}`;
          } else if (
            property.schema.maximum &&
            input > property.schema.maximum
          ) {
            return `${property.name} must be less than ${property.schema.maximum}`;
          }

          return true;
        },
      },
    ]);

    for (let i = 0; i < count; i++) {
      this.log(`Inputs for ${property.name}[${i}]:`);
      results.push(
        await this.promptForSchemaProperties(
          graph,
          provider,
          property.name as ResourceType,
          { name: `${property.name}[${i}]`, schema: property.schema.items },
          existingValues,
        ),
      );
    }

    return results;
  }

  /**
   * Prompt the user to provide a numerical value that matches the schema requirements
   */
  private async promptForNumberInputs(
    property: { name: string; schema: JSONSchemaType<number> },
    validator?: (input?: number) => string | true,
    existingValues: Record<string, unknown> = {},
  ): Promise<number> {
    const { result } = await inquirer.prompt<{ result: number }>(
      [
        {
          name: 'result',
          type: 'input', // https://github.com/SBoudrias/Inquirer.js/issues/866
          message: `${property.schema.description || property.name}${
            property.schema.properties.required ? '' : ' (optional)'
          }`,
          validate: (input_string?: string) => {
            if (input_string) {
              const number = Number.parseFloat(input_string);
              if (Number.isNaN(number)) {
                return 'Must be a number';
              }
            }

            const input = input_string as unknown as number;
            if (property.schema.properties.required && !input) {
              return `${property.name} is required`;
            } else if (
              property.schema.minimum &&
              input &&
              input < property.schema.minimum
            ) {
              return `${property.name} must be greater than ${property.schema.minimum}`;
            } else if (
              property.schema.maximum &&
              input &&
              input > property.schema.maximum
            ) {
              return `${property.name} must be less than ${property.schema.maximum}`;
            }

            return validator ? validator(input) : true;
          },
        },
      ],
      existingValues[property.name]
        ? {
            result: existingValues[property.name] as number,
          }
        : {},
    );
    return result;
  }

  /**
   * Prompt the user to provider a string value that matches the schema requirements
   */
  protected async promptForStringInputs(
    property: { name: string; schema: JSONSchemaType<string> },
    validator?: (input?: string) => string | true,
    existingValues: Record<string, unknown> = {},
  ): Promise<string> {
    const { result } = await inquirer.prompt<{ result: string }>(
      [
        {
          name: 'result',
          type: 'input',
          message: `${property.schema.description || property.name}${
            property.schema.properties?.required ? '' : ' (optional)'
          }`,
          validate: (input?: string) => {
            if (property.schema.properties?.required && !input) {
              return `${property.name} is required`;
            }

            return validator ? validator(input) : true;
          },
        },
      ],
      existingValues[property.name]
        ? {
            result: existingValues[property.name] as string,
          }
        : {},
    );
    return result;
  }

  /**
   * Prompts the user for misc key/value inputs matching the structure of the JSON schema provided
   */
  private async promptForKeyValueInputs<T extends Record<string, unknown>>(
    graph: CloudGraph,
    provider: Provider,
    property: { name: string; schema: JSONSchemaType<any> },
    data: Record<string, unknown> = {},
  ): Promise<T> {
    const results: any = {};
    this.log(`${property.name} is a key/value store.`);

    while (
      await this.promptForContinuation(
        `Would you like to add a key/value pair to ${property.name}?`,
      )
    ) {
      const { key } = await inquirer.prompt([
        {
          name: 'key',
          type: 'input',
          message: 'Key:',
        },
      ]);

      results[key] = await this.promptForSchemaProperties<any>(
        graph,
        provider,
        key,
        { name: key, schema: property.schema.additionalProperties },
        data,
      );
    }

    return results;
  }

  /**
   * Prompt the user to select from a list of available resources or create a new one
   */
  private async promptForResourceID(
    graph: CloudGraph,
    provider: Provider,
    property: { name: ResourceType; schema: JSONSchemaType<string> },
    data: Record<string, unknown> = {},
  ): Promise<string | undefined> {
    const service = provider.resources[property.name];
    if (!service) {
      throw new Error(
        `The ${provider.type} provider doesn't support ${property.name}s`,
      );
    } else if (!service.list) {
      throw new Error(
        `The ${provider.type} provider cannot query ${property.name}s`,
      );
    }

    const { rows: options } = await service.list(data as any);
    options.sort((a, b) => a.id.localeCompare(b.id));

    const answers = await inquirer.prompt(
      [
        {
          name: property.name,
          type: 'list',
          message: property.schema.description || property.name,
          choices: [
            ...options.map((row) => ({
              name: row.id,
              value: row.id,
            })),
            ...('construct' in service || 'create' in service
              ? [
                  new inquirer.Separator(),
                  {
                    value: 'create-new',
                    name: `Create a new ${property.name}`,
                  },
                ]
              : []),
          ],
        },
      ],
      data,
    );

    if (answers[property.name as string] === 'create-new') {
      this.log(`Inputs for ${property.name}`);
      const node = await this.promptForNewResource(
        graph,
        provider,
        property.name,
        data,
      );
      this.log(`End ${property.name} inputs`);
      return `\${{ ${node.id}.id }}`;
    } else if (answers[property.name as string] === 'none') {
      return undefined;
    } else {
      return answers[property.name];
    }
  }

  /**
   * Look through all providers and determine if a resource type is creatable
   */
  protected async isCreatableResourceType(
    resourceType: ResourceType,
  ): Promise<boolean> {
    for (const [provider_name, provider_constructor] of Object.entries(
      SupportedProviders,
    )) {
      const any_value: any = {};
      const provider = new provider_constructor(
        provider_name,
        any_value,
        any_value,
      ) as Provider<any>;

      const service = provider.resources[resourceType];
      if (service && ('construct' in service || 'create' in service)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Prompt the user to input property values matching the JSON schema provided
   */
  private async promptForSchemaProperties<T>(
    graph: CloudGraph,
    provider: Provider,
    resourceType: ResourceType,
    property: { name: string; schema: JSONSchemaType<T> },
    data: Record<string, unknown> = {},
  ): Promise<T> {
    let schema = property.schema as JSONSchemaType<any>;
    if (schema.$ref && schema.definitions) {
      schema = schema.definitions[
        schema.$ref.replace('#/definitions/', '')
      ] as JSONSchemaType<any>;
    } else if (schema.$ref) {
      this.error('Invalid json schema');
    }

    const validators = provider.resources[resourceType]?.validators;
    const validator = validators
      ? (validators as any)[property.name]
      : undefined;

    if (data[property.name]) {
      return data[property.name] as any;
    } else if (ResourceTypeList.includes(property.name as ResourceType)) {
      const res = (await this.promptForResourceID(
        graph,
        provider,
        { name: property.name as ResourceType, schema: schema as any },
        data,
      )) as any;
      data[property.name] = res;
      return res;
    } else if (schema.type === 'object' && schema.properties) {
      let res: Record<string, unknown> = {};
      for (const [propertyName, propertySchema] of Object.entries<any>(
        schema.properties,
      )) {
        res[propertyName] = await this.promptForSchemaProperties(
          graph,
          provider,
          resourceType,
          { name: propertyName, schema: propertySchema },
          data,
        );
      }

      if (property.schema.additionalProperties) {
        res = {
          ...res,
          ...(await this.promptForKeyValueInputs(graph, provider, {
            name: property.name,
            schema,
          }),
          data),
        };
      }

      return res as any;
    } else if (property.schema.type === 'array') {
      return this.promptForArrayInputs(
        graph,
        provider,
        {
          name: property.name,
          schema,
        },
        data,
      ) as any;
    } else if (property.schema.type === 'number') {
      return this.promptForNumberInputs(
        {
          name: property.name,
          schema: schema as JSONSchemaType<number>,
        },
        validator,
        data,
      ) as any;
    } else {
      return this.promptForStringInputs(
        {
          name: property.name,
          schema: schema as JSONSchemaType<string>,
        },
        validator,
        data,
      ) as any;
    }
  }

  /**
   * Prompt the user to select a provider they've registered locally. This will also allow them to create a new provider in-line.
   */
  protected async promptForAccount(
    options: {
      account?: string;
      type?: ResourceType;
      action?: 'list' | 'get' | 'create' | 'update' | 'delete';
      message?: string;
    } = {},
  ): Promise<Provider> {
    const allAccounts = this.providerStore.getProviders();
    const filteredAccounts: Provider[] = [];
    for (const p of allAccounts) {
      if (options.type && p.resources[options.type]) {
        const service = p.resources[options.type]!;
        if (
          !options.action ||
          options.action in service ||
          (['create', 'update', 'delete'].includes(options.action) &&
            'construct' in service)
        ) {
          filteredAccounts.push(p);
        }
      } else if (!options.type) {
        filteredAccounts.push(p);
      }
    }

    const newAccountName = 'Add a new account';

    const res = await inquirer.prompt(
      [
        {
          name: 'account',
          type: 'list',
          message: options.message || 'Select an account',
          choices: [
            ...filteredAccounts.map((p) => ({
              name: `${p.name} (${p.type})`,
              value: p.name,
            })),
            newAccountName,
          ],
        },
      ],
      { account: options.account },
    );

    if (res.account === newAccountName) {
      return createProvider();
    }

    const account = filteredAccounts.find((p) => p.name === res.account);
    if (!account) {
      this.error(`Account ${res.account} not found`);
    }

    return account;
  }

  /**
   * Prompt the user to select a resource type that matches the provider and action specified.
   */
  protected async promptForResourceType(
    provider: Provider,
    action: 'list' | 'get' | 'create' | 'update' | 'delete',
    input?: string,
    optional?: boolean,
  ): Promise<ResourceType> {
    const resources = provider.getResourceEntries();
    resources.filter(([type, service]) => {
      return action in service && (!input || type === input);
    });

    if (resources.length === 0) {
      this.error(
        `The cloud provider for ${provider.name} does not support ${action} ${input}s`,
      );
    }

    const res = await inquirer.prompt(
      [
        {
          name: 'type',
          type: 'list',
          message: `What type of resource do you want to ${action}?`,
          choices: resources.map(([type, _]) => type),
        },
      ],
      { type: input },
    );

    return res.type;
  }

  /**
   * Prompt the user for the inputs required to create a new cloud resource module
   */
  protected async promptForNewResource<T extends ResourceType>(
    graph: CloudGraph,
    account: Provider,
    type: T,
    data: Record<string, unknown> = {},
  ): Promise<CloudNode<T>> {
    const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
    const schemaPath = path.join(
      __dirname,
      './@resources',
      type,
      './inputs.schema.json',
    );
    const schemaString = await fs.readFile(schemaPath, 'utf8');
    let schema = JSON.parse(schemaString);
    if (schema.$ref && schema.definitions) {
      schema = schema.definitions[schema.$ref.replace('#/definitions/', '')];
    }

    const service = account.resources[type];
    if (!service) {
      this.error(
        `The ${account.type} provider does not work with ${type} resources`,
      );
    }

    if (!('construct' in service) && !('create' in service)) {
      this.error(
        `The ${account.type} provider cannot create ${type} resources`,
      );
    }

    if (service.presets?.length) {
      const { result } = await inquirer.prompt([
        {
          name: 'result',
          type: 'list',
          message:
            'Please select one of our default configurations or customize the creation of your resource.',
          choices: [
            ...service.presets.map((p) => ({
              name: p.display,
              value: p.values,
            })),
            {
              name: 'Custom',
              values: {},
            },
          ],
        },
      ]);

      data = deepmerge(data, result);
    }

    const inputs = await this.promptForSchemaProperties<any>(
      graph,
      account,
      type,
      {
        name: '',
        schema,
      },
      data,
    );

    const node = new CloudNode<T>({
      name: type,
      inputs: {
        type,
        account: account.name,
        ...inputs,
      },
    });
    graph.insertNodes(node);

    return node;
  }

  protected handleTerraformError(ex: any): void {
    if (!ex.stderr) {
      throw ex;
    }
    const errorPrefix = 'Error: ';
    const errorPrefixLength = errorPrefix.length;
    console.log(chalk.red('We have encountered an issue...'));
    console.log(ex);
    for (const line of ex.stderr.split('\n') as string[]) {
      const index = line.indexOf(errorPrefix);
      if (index !== -1) {
        console.log(line.substring(index + errorPrefixLength));
        break;
      }
    }
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }
}
