import cliSpinners from 'cli-spinners';
import { colors } from 'cliffy/ansi/colors.ts';
import { Command } from 'cliffy/command/mod.ts';
import { Confirm, Input, Number as NumberPrompt, prompt, Secret, Select } from 'cliffy/prompt/mod.ts';
import logUpdate from 'log-update';
import { JSONSchemaType } from 'npm:ajv';
import { deepMerge } from 'std/collections/deep_merge.ts';
import * as path from 'std/path/mod.ts';
import winston from 'winston';
import { WritableResourceService } from '../@providers/base.service.ts';
import { Provider, ProviderStore, SupportedProviders } from '../@providers/index.ts';
import { ResourceType, ResourceTypeList } from '../@resources/index.ts';
import { CloudEdge, CloudGraph, CloudNode } from '../cloud-graph/index.ts';
import { ComponentStore } from '../component-store/index.ts';
import {
  Datacenter,
  DatacenterRecord,
  DatacenterStore,
  ParsedVariablesMetadata,
  ParsedVariablesType,
} from '../datacenters/index.ts';
import { Environment, EnvironmentRecord, EnvironmentStore } from '../environments/index.ts';
import { Pipeline, PipelineStep } from '../pipeline/index.ts';
import CloudCtlConfig from '../utils/config.ts';
import { CldCtlProviderStore } from '../utils/provider-store.ts';
import { createTable } from '../utils/table.ts';

export type GlobalOptions = {
  configHome?: string;
};

export function BaseCommand() {
  return new Command().globalEnv(
    'XDG_CONFIG_HOME=<value:string>',
    'Configuration folder location.',
    {
      prefix: 'XDG_',
    },
  );
}

export class CommandHelper {
  private spinner_frame_index = 0;
  private options: GlobalOptions;

  constructor(options: GlobalOptions) {
    this.options = options;
    CloudCtlConfig.setConfigDirectory(options.configHome);
  }

  get componentStore(): ComponentStore {
    const config_dir = CloudCtlConfig.getConfigDirectory();
    return new ComponentStore(
      path.join(config_dir, 'component-store'),
      'registry.architect.io',
    );
  }

  get providerStore(): ProviderStore {
    return new CldCtlProviderStore(CloudCtlConfig.getConfigDirectory());
  }

  get datacenterStore(): DatacenterStore {
    return new DatacenterStore(CloudCtlConfig.getConfigDirectory());
  }

  get environmentStore(): EnvironmentStore {
    return new EnvironmentStore(CloudCtlConfig.getConfigDirectory());
  }

  /**
   * Store the pipeline in the datacenter secret manager and then log
   * it to the environment store
   */
  public saveEnvironment(
    datacenterName: string,
    environmentName: string,
    datacenter: Datacenter,
    environment: Environment,
    pipeline: Pipeline,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const secretStep = new PipelineStep({
        action: 'create',
        type: 'secret',
        name: `${environmentName}-environment-pipeline`,
        inputs: {
          type: 'secret',
          name: 'environment-pipeline',
          namespace: `${datacenterName}-${environmentName}`,
          account: datacenter.getSecretsConfig().account,
          data: JSON.stringify(pipeline),
        },
      });

      secretStep
        .apply({
          providerStore: this.providerStore,
        })
        .subscribe({
          complete: async () => {
            if (!secretStep.outputs) {
              console.error('Something went wrong storing the pipeline');
              Deno.exit(1);
            }

            await this.environmentStore.save({
              name: environmentName,
              datacenter: datacenterName,
              config: environment,
              lastPipeline: {
                account: datacenter.getSecretsConfig().account,
                secret: secretStep.outputs.id,
              },
            });
            resolve();
          },
          error: (err) => {
            reject(err);
          },
        });
    });
  }

  public removeEnvironment(datacenter: Datacenter, record: EnvironmentRecord): Promise<void> {
    return new Promise((resolve, reject) => {
      const secretStep = new PipelineStep({
        action: 'delete',
        type: 'secret',
        name: `${record.name}-environment-pipeline`,
        inputs: {
          type: 'secret',
          name: 'environment-pipeline',
          namespace: `${record.datacenter}-${record.name}`,
          data: '',
          account: datacenter.getSecretsConfig().account,
        },
        outputs: {
          id: `${record.datacenter}-${record.name}/environment-pipeline`,
          data: '',
        },
      });

      secretStep
        .apply({
          providerStore: this.providerStore,
        })
        .subscribe({
          complete: async () => {
            await this.environmentStore.remove(record.name);
            resolve();
          },
        });
    });
  }

  /**
   * Store the pipeline in the datacenters secret manager and then log
   * it to the datacenter store
   */
  public saveDatacenter(
    datacenterName: string,
    datacenter: Datacenter,
    pipeline: Pipeline,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const secretStep = new PipelineStep({
        action: 'create',
        type: 'secret',
        name: `${datacenterName}-datacenter-pipeline`,
        inputs: {
          type: 'secret',
          name: 'datacenter-pipeline',
          namespace: datacenterName,
          account: datacenter.getSecretsConfig().account,
          data: JSON.stringify(pipeline),
        },
      });

      secretStep
        .apply({
          providerStore: this.providerStore,
        })
        .subscribe({
          complete: async () => {
            if (!secretStep.outputs) {
              console.error('Something went wrong storing the pipeline');
              Deno.exit(1);
            }

            await this.datacenterStore.save({
              name: datacenterName,
              config: datacenter,
              lastPipeline: {
                account: datacenter.getSecretsConfig().account,
                secret: secretStep.outputs.id,
              },
            });
            resolve();
          },
          error: (err) => {
            reject(err);
          },
        });
    });
  }

  public removeDatacenter(record: DatacenterRecord): Promise<void> {
    return new Promise((resolve, reject) => {
      const secretStep = new PipelineStep({
        action: 'delete',
        type: 'secret',
        name: `${record.name}-datacenter-pipeline`,
        inputs: {
          type: 'secret',
          name: 'datacenter-pipeline',
          namespace: record.name,
          data: '',
          account: record.config.getSecretsConfig().account,
        },
        outputs: {
          id: `${record.name}/datacenter-pipeline`,
          data: '',
        },
      });

      secretStep
        .apply({
          providerStore: this.providerStore,
        })
        .subscribe({
          complete: async () => {
            await this.datacenterStore.remove(record.name);
            resolve();
          },
        });
    });
  }

  public async getPipelineForDatacenter(
    record: DatacenterRecord,
  ): Promise<Pipeline> {
    const secretAccount = this.providerStore.getProvider(
      record.lastPipeline.account,
    );
    if (!secretAccount) {
      console.error(
        `Invalid account used by datacenter for secrets: ${record.lastPipeline.account}`,
      );
      Deno.exit(1);
    }

    const service = secretAccount.resources.secret;
    if (!service) {
      console.error(
        `The ${secretAccount.type} provider doesn't support secrets`,
      );
      Deno.exit(1);
    }

    const secret = await service.get(record.lastPipeline.secret);
    if (!secret) {
      return new Pipeline();
    }

    const rawPipeline = JSON.parse(secret.data);

    return new Pipeline({
      steps: rawPipeline.steps.map((step: any) => new PipelineStep(step)),
      edges: rawPipeline.edges.map((edge: any) => new CloudEdge(edge)),
    });
  }

  public async getPipelineForEnvironment(record: EnvironmentRecord): Promise<Pipeline> {
    const secretAccount = this.providerStore.getProvider(record.lastPipeline.account);
    if (!secretAccount) {
      console.error(`Invalid account used by datacenter for secrets: ${record.lastPipeline.account}`);
      Deno.exit(1);
    }

    const service = secretAccount.resources.secret;
    if (!service) {
      console.error(`The ${secretAccount.type} provider doesn't support secrets`);
      Deno.exit(1);
    }

    const secret = await service.get(record.lastPipeline.secret);
    if (!secret) {
      return new Pipeline();
    }

    const rawPipeline = JSON.parse(secret.data);

    return new Pipeline({
      steps: rawPipeline.steps.map((step: any) => new PipelineStep(step)),
      edges: rawPipeline.edges.map((edge: any) => new CloudEdge(edge)),
    });
  }

  public async confirmPipeline(pipeline: Pipeline, autoApprove: boolean): Promise<void> {
    if (autoApprove) {
      return;
    }
    this.renderPipeline(pipeline);
    const shouldContinue = await this.promptForContinuation('Do you want to apply the above changes?');
    if (!shouldContinue) {
      Deno.exit(0);
    }
  }

  /**
   * Render the executable graph and the status of each resource
   */
  public renderPipeline(
    pipeline: Pipeline,
    options?: { clear?: boolean; message?: string; disableSpinner?: boolean },
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
                (step.status.startTime || Date.now())) / 1000,
            ) + 's',
            step.status.message || '',
          );

          return row;
        }),
    );

    if (options?.clear) {
      const spinner = cliSpinners.dots.frames[this.spinner_frame_index];
      this.spinner_frame_index = ++this.spinner_frame_index % cliSpinners.dots.frames.length;
      const message = !options.disableSpinner
        ? spinner + ' ' + (options.message || 'Applying changes') + '\n' + table.toString()
        : table.toString();
      if (options.disableSpinner) {
        logUpdate.clear();
      }
      logUpdate(message);
    } else {
      console.log(table.toString());
    }
  }

  /**
   * Helper method to indicate the rendering pipeline is complete
   */
  public doneRenderingPipeline(): void {
    logUpdate.done();
  }

  /**
   * Helper method to prompt users to confirm they're ready to proceed
   */
  private async promptForContinuation(message: string): Promise<boolean> {
    return await Confirm.prompt(message);
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

    const count = await NumberPrompt.prompt({
      message: `How many ${property.schema.description || property.name} should be created?`,
      validate: (value: string) => {
        if (
          !(typeof value === 'number' || (!!value && !isNaN(Number(value))))
        ) {
          return false;
        }

        const val = parseFloat(value);

        if (property.schema.minimum && val < property.schema.minimum) {
          return `${property.name} must be greater than ${property.schema.minimum}`;
        } else if (property.schema.maximum && val > property.schema.maximum) {
          return `${property.name} must be less than ${property.schema.maximum}`;
        }
        return false;
      },
    });

    for (let i = 0; i < count; i++) {
      console.log(`Inputs for ${property.name}[${i}]:`);
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
    if (existingValues[property.name]) {
      return existingValues[property.name] as number;
    }

    const result = await Input.prompt({
      message: `${property.schema.description || property.name}${
        property.schema.properties?.required ? '' : ' (optional)'
      }`,
      validate: (value?: string) => {
        const number = Number.parseFloat(value || '');
        if (value && Number.isNaN(number)) {
          return 'Must be a number';
        }

        if (property.schema.properties?.required && !value) {
          return `${property.name} is required`;
        } else if (
          property.schema.minimum && value && number < property.schema.minimum
        ) {
          return `${property.name} must be greater than ${property.schema.minimum}`;
        } else if (
          property.schema.maximum && value && number > property.schema.maximum
        ) {
          return `${property.name} must be less than ${property.schema.maximum}`;
        }

        return validator ? validator(number) : true;
      },
    });

    return Number.parseFloat(result);
  }

  /**
   * Prompt the user to provider a string value that matches the schema requirements
   */
  public async promptForStringInputs(
    property: { name: string; schema: JSONSchemaType<string> },
    validator?: (input?: string) => string | true,
    existingValues: Record<string, unknown> = {},
  ): Promise<string> {
    if (existingValues[property.name]) {
      return existingValues[property.name] as string;
    }

    const result = await Input.prompt({
      message: `${property.schema.description || property.name}${
        property.schema.properties?.required ? '' : ' (optional)'
      }`,
      validate: (input?: string) => {
        if (property.schema.properties?.required && !input) {
          return `${property.name} is required`;
        }

        return validator ? validator(input) : true;
      },
    });

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
    console.log(`${property.name} is a key/value store.`);

    while (
      await this.promptForContinuation(
        `Would you like to add a key/value pair to ${property.name}?`,
      )
    ) {
      const key = await Input.prompt('Key:');

      results[key] = await this.promptForSchemaProperties<any>(
        graph,
        provider,
        key as any,
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
      return this.promptForStringInputs(property, undefined, data);
    }

    const { rows: options } = await service.list(data as any);
    options.sort((a, b) => a.id.localeCompare(b.id));

    let answer: string | undefined;
    if (options.length === 1) {
      answer = options[0].id;
    } else if (options.length > 1) {
      answer = await Select.prompt({
        message: property.schema.description || property.name,
        options: [
          ...options.map((row) => ({
            name: row.id,
            value: row.id,
          })),
          ...('apply' in service
            ? [
              Select.separator(),
              {
                value: 'create-new',
                name: `Create a new ${property.name}`,
              },
            ]
            : []),
        ],
      });
    }

    if (answer === 'create-new') {
      console.log(`Inputs for ${property.name}`);
      const node = await this.promptForNewResource(
        graph,
        provider,
        property.name,
        data,
      );
      console.log(`End ${property.name} inputs`);
      return `\${{ ${node.id}.id }}`;
    } else if (answer === 'none') {
      return undefined;
    } else {
      return answer;
    }
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
      schema = schema
        .definitions[
          schema.$ref.replace('#/definitions/', '')
        ] as JSONSchemaType<any>;
    } else if (schema.$ref) {
      console.error('Invalid json schema');
    }

    const resource = provider.resources[resourceType];
    let validator = undefined;
    if (resource && 'validators' in resource) {
      const validators = resource.validators;
      validator = validators ? (validators as any)[property.name] : undefined;
    }

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
      for (
        const [propertyName, propertySchema] of Object.entries<any>(
          schema.properties,
        )
      ) {
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
  public async promptForAccount(
    options: {
      account?: string;
      prompt_accounts?: Provider[];
      type?: ResourceType;
      action?: 'list' | 'get' | 'create' | 'update' | 'delete';
      message?: string;
    } = {},
  ): Promise<Provider> {
    const allAccounts = this.providerStore.getProviders();
    let filteredAccounts: Provider[] = [];
    if (!options.prompt_accounts) {
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
    } else {
      filteredAccounts = options.prompt_accounts;
    }

    let account;
    let selected_account = options.account;
    if (options.account) {
      account = filteredAccounts.find((a) => a.name === options.account);
    } else {
      const newAccountName = 'Add a new account';

      selected_account = await Select.prompt({
        message: options.message || 'Select an account',
        options: [
          ...filteredAccounts.map((p) => ({
            name: `${p.name} (${p.type})`,
            value: p.name,
          })),
          {
            name: newAccountName,
            value: newAccountName,
          },
        ],
      });

      if (selected_account === newAccountName) {
        return this.createAccount();
      }

      account = filteredAccounts.find((p) => p.name === selected_account);
    }

    if (!account) {
      console.error(`Account ${selected_account} not found`);
      Deno.exit(1);
    }

    return account;
  }

  /**
   * Prompt the user to select a resource type that matches the provider and action specified.
   */
  public async promptForResourceType(
    provider: Provider,
    action: 'list' | 'get' | 'create' | 'update' | 'delete',
    input?: string,
    optional?: boolean,
  ): Promise<ResourceType> {
    const resources = provider.getResourceEntries().filter(
      ([type, service]) => {
        return (action in service || 'construct' in service) &&
          (!input || type === input);
      },
    );

    if (resources.length === 0) {
      console.error(
        `The cloud provider ${provider.type} cannot ${action} ${input}s`,
      );
      Deno.exit(1);
    }

    if (input && resources.length === 1) {
      return resources.map(([type, _]) => type)[0];
    } else {
      return (await Select.prompt({
        message: `What type of resource do you want to ${action}?`,
        options: resources.map(([type, _]) => ({
          name: type,
          value: type,
        })),
      })) as ResourceType;
    }
  }

  /**
   * Prompt the user for the inputs required to create a new cloud resource module
   */
  public async promptForNewResource<T extends ResourceType>(
    graph: CloudGraph,
    account: Provider,
    type: T,
    data: Record<string, unknown> = {},
  ): Promise<CloudNode<T>> {
    const __dirname = new URL('.', import.meta.url).pathname;
    const schemaPath = path.join(
      __dirname,
      '../@resources',
      type,
      './inputs.schema.json',
    );
    const schemaString = await Deno.readTextFile(schemaPath);
    let schema = JSON.parse(schemaString);
    if (schema.$ref && schema.definitions) {
      schema = schema.definitions[schema.$ref.replace('#/definitions/', '')];
    }

    const service = account.resources[type];
    if (!service) {
      console.error(
        `The ${account.type} provider does not work with ${type} resources`,
      );
      Deno.exit(1);
    }

    if (!('construct' in service) && !('create' in service)) {
      console.error(
        `The ${account.type} provider cannot create ${type} resources`,
      );
      Deno.exit(1);
    }

    const writableService = service as unknown as WritableResourceService<
      T,
      Provider
    >;
    if (writableService.presets && writableService.presets.length > 0) {
      const result = await Select.prompt({
        message: 'Please select one of our default configurations or customize the creation of your resource.',
        options: [...writableService.presets.map((p) => p.display), 'custom'],
      });

      let service_preset_values = writableService.presets.find((p) => p.display === result)?.values;
      if (!service_preset_values || result === 'custom') {
        service_preset_values = {};
      }

      data = deepMerge(data, service_preset_values);
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

  public async promptForCredentials(
    provider_type: keyof typeof SupportedProviders,
  ): Promise<Record<string, string>> {
    const credential_schema = SupportedProviders[provider_type].CredentialsSchema;

    const credentials: Record<string, string> = {};
    for (const [key, value] of Object.entries(credential_schema.properties)) {
      const propValue = value as any;
      const message = [key];
      if (propValue.nullable) {
        message.push('(optional)');
      }
      const cred = await Secret.prompt({
        message: message.join(' '),
        default: propValue.default || '',
      });

      if (!propValue.nullable && cred === '') {
        console.log('Required credential requires input');
        Deno.exit(1);
      }

      credentials[key] = cred;
    }

    return credentials;
  }

  private async createAccount(): Promise<Provider> {
    const allAccounts = this.providerStore.getProviders();
    const providers = Object.keys(SupportedProviders);

    const res = await prompt([
      {
        name: 'name',
        type: Input,
        message: 'What would you like to name the new account?',
        validate: (input: string) => {
          if (allAccounts.some((a) => a.name === input)) {
            return 'An account with that name already exists.';
          }
          return true;
        },
      },
      {
        type: Select,
        name: 'type',
        message: 'What type of provider are you registering the credentials for?',
        options: providers,
      },
    ]);

    const providerType = res.type as keyof typeof SupportedProviders;
    const credentials = await this.promptForCredentials(providerType);

    const account = new SupportedProviders[providerType](
      res.name!,
      credentials as any,
      this.providerStore,
    );

    const validCredentials = await account.testCredentials();
    if (!validCredentials) {
      throw new Error('Invalid credentials');
    }

    try {
      this.providerStore.saveProvider(account);
      console.log(`${account.name} account registered`);
    } catch (ex: any) {
      console.error(ex.message);
      Deno.exit(1);
    }

    return account;
  }

  public handleTerraformError(ex: any): void {
    if (!ex.stderr) {
      throw ex;
    }
    const errorPrefix = 'Error: ';
    const errorPrefixLength = errorPrefix.length;
    console.log(colors.red('We have encountered an issue...'));
    console.log(ex);
    for (const line of ex.stderr.split('\n') as string[]) {
      const index = line.indexOf(errorPrefix);
      if (index !== -1) {
        console.log(line.substring(index + errorPrefixLength));
        break;
      }
    }
    Deno.exit(1);
  }

  /**
   * Prompts for all variables required by a datacenter.
   * If variables cannot be prompted in a valid order (e.g. a cycle in variable dependencies),
   * an error is thrown.
   */
  public async promptForVariables(
    graph: CloudGraph,
    variables: ParsedVariablesType,
  ): Promise<Record<string, unknown>> {
    const variable_inputs: Record<string, unknown> = {};
    const sorted_vars = this.sortVariables(variables);

    while (sorted_vars.length > 0) {
      const variable = sorted_vars.shift()!;

      const variable_value = await this.promptForVariableFromMetadata(
        graph,
        variable.name,
        variable.metadata,
      );

      variable_inputs[variable.name] = variable_value;
      // Fill in metadata that relied on this variable
      for (const next_variable of sorted_vars) {
        if (next_variable.dependencies.has(variable.name)) {
          const dependency = variables[next_variable.name].dependant_variables
            ?.find((dep) => dep.value === variable.name)!;

          (next_variable.metadata as Record<string, unknown>)[dependency.key] = variable_value;
        }
      }
    }
    return variable_inputs;
  }

  private async promptForVariableFromMetadata(
    graph: CloudGraph,
    name: string,
    metadata: ParsedVariablesMetadata,
  ): Promise<string | boolean | number | undefined> {
    const message = `${name}: ${metadata.description}`;
    if (metadata.type === 'string') {
      return Input.prompt({ message });
    } else if (metadata.type === 'boolean') {
      return Confirm.prompt({ message });
    } else if (metadata.type === 'number') {
      return NumberPrompt.prompt({ message });
    } else if (metadata.type === 'arcctlAccount') {
      const existing_accounts = this.providerStore.getProviders();
      const query_accounts = metadata.provider
        ? existing_accounts.filter((p) => p.type === metadata.provider)
        : existing_accounts;
      const account = await this.promptForAccount({
        prompt_accounts: query_accounts,
        message: message,
      });
      return account.name;
    } else {
      // In this case, metadata.type is a non-special-case ResourceInputs key.
      if (!metadata.arcctlAccount) {
        throw new Error(
          `Resource type ${metadata.type} cannot be prompted for without setting arcctlAccount.`,
        );
      }
      const provider = this.providerStore.getProvider(metadata.arcctlAccount);
      if (!provider) {
        throw new Error(`Provider ${metadata.arcctlAccount} does not exist.`);
      }

      return this.promptForResourceID(graph, provider, {
        name: name as ResourceType,
        schema: { description: message } as any,
      });
    }
  }

  /*
   * Sort ParsedVariablesType into an order that can be prompted for, ensuring variables that
   * depend on other variables get resolved first. If no valid order exists (e.g., there are cycles),
   * this raises an error.
   */
  protected sortVariables(
    variables: ParsedVariablesType,
  ): {
    name: string;
    metadata: ParsedVariablesMetadata;
    dependencies: Set<string>;
  }[] {
    const variable_graph: Record<string, Set<string>> = {};
    for (
      const [variable_name, variable_metadata] of Object.entries(variables)
    ) {
      const var_dependencies = new Set(
        variable_metadata.dependant_variables ? variable_metadata.dependant_variables.map((v) => v.value) : [],
      );
      variable_graph[variable_name] = var_dependencies;
    }

    const result: string[] = [];
    const discovered = new Set<string>();
    const finished = new Set<string>();
    for (const var_name of Object.keys(variable_graph)) {
      if (!finished.has(var_name) && !discovered.has(var_name)) {
        this.topologicalSort(
          variable_graph,
          var_name,
          discovered,
          finished,
          result,
        );
      }
    }
    // We must reverse the topological sort to get the correct ordering - the edges in this
    // graph are variables the node depends on, so those dependencies must be prompted for first.
    result.reverse();

    const vars = [];
    for (const var_name of result) {
      vars.push({
        name: var_name,
        metadata: variables[var_name],
        dependencies: variable_graph[var_name],
      });
    }
    return vars;
  }

  /**
   * Topologically sort the graph, and raise an error if a cycle is detected.
   */
  private topologicalSort(
    graph: Record<string, Set<string>>,
    node: string,
    discovered: Set<string>,
    finished: Set<string>,
    result: string[],
  ) {
    discovered.add(node);

    for (const edge of graph[node]) {
      if (discovered.has(edge)) {
        throw Error(
          `A circular dependency has been found between the variables '${node}' and '${edge}'`,
        );
      }
      if (!finished.has(edge)) {
        this.topologicalSort(graph, edge, discovered, finished, result);
      }
    }

    discovered.delete(node);
    finished.add(node);
    result.unshift(node);
  }

  public async applyDatacenter(
    name: string,
    datacenter: Datacenter,
    pipeline: Pipeline,
    logger: winston.Logger | undefined,
  ): Promise<void> {
    return pipeline
      .apply({
        providerStore: this.providerStore,
        logger: logger,
      })
      .toPromise()
      .then(async () => {
        await this.saveDatacenter(name, datacenter, pipeline);
      })
      .catch(async (err) => {
        await this.saveDatacenter(name, datacenter, pipeline);
        console.error(err);
        Deno.exit(1);
      });
  }

  public async applyEnvironment(
    name: string,
    datacenterRecord: DatacenterRecord,
    environment: Environment,
    pipeline: Pipeline,
    logger: winston.Logger | undefined,
  ): Promise<void> {
    return pipeline
      .apply({
        providerStore: this.providerStore,
        logger,
      })
      .toPromise()
      .then(async () => {
        await this.saveEnvironment(
          datacenterRecord.name,
          name,
          datacenterRecord.config,
          environment!,
          pipeline,
        );
      })
      .catch(async (err) => {
        await this.saveEnvironment(
          datacenterRecord.name,
          name,
          datacenterRecord.config,
          environment!,
          pipeline,
        );
        console.error(err);
        Deno.exit(1);
      });
  }
}
