import {
  Provider,
  SupportedProviders,
  ProviderCredentials,
  ResourceModule,
  ProviderStore,
} from './@providers/index.js';
import {
  ResourceInputs,
  ResourceType,
  ResourceTypeList,
} from './@resources/index.js';
import { ComponentStore } from './component-store/index.js';
import { ExecutableGraph } from './executable-graph/index.js';
import CloudCtlConfig from './utils/config.js';
import { DatacenterStore } from './utils/datacenter-store.js';
import { EnvironmentStore } from './utils/environment-store.js';
import { CldCtlProviderStore } from './utils/provider-store.js';
import { createProvider, getProviders } from './utils/providers.js';
import { CldCtlTerraformStack } from './utils/stack.js';
import { createTable } from './utils/table.js';
import { Command, Config } from '@oclif/core';
import { JSONSchemaType } from 'ajv';
import { TerraformOutput, TerraformStack } from 'cdktf';
import chalk from 'chalk';
import cliSpinners from 'cli-spinners';
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
   * Render the executable graph and the status of each resource
   */
  protected renderGraph(
    graph: ExecutableGraph,
    options?: { showEnvironment?: boolean },
  ): void {
    const headers = ['Name', 'Type', 'Component'];
    if (options?.showEnvironment) {
      headers.push('Environment');
    }

    headers.push('Action', 'Status', 'Time');

    const table = createTable({
      head: headers,
    });

    table.push(
      ...graph.nodes
        .sort(
          (first, second) =>
            second.environment?.localeCompare(first.environment || '') ||
            second.component?.localeCompare(first.component || '') ||
            0,
        )
        .map((node) => {
          const row = [node.name, node.type, node.component || ''];
          if (options?.showEnvironment) {
            row.push(node.environment || '');
          }

          row.push(
            node.action,
            node.status.state,
            Math.floor(
              ((node.status.endTime || Date.now()) -
                (node.status.startTime || Date.now())) /
                1000,
            ) + 's',
            node.status.message || '',
          );

          return row;
        }),
    );

    readline.cursorTo(process.stdout, 0, 0);
    readline.clearScreenDown(process.stdout);

    const spinner = cliSpinners.dots.frames[this.spinner_frame_index];
    this.spinner_frame_index =
      ++this.spinner_frame_index % cliSpinners.dots.frames.length;

    this.log(spinner + ' Applying changes to environment');
    this.log('\n' + table.toString());
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
   * @param provider Provider used to query property options matching cldctl resources
   * @param property.name Name of the array property in the parent schema
   * @param property.schema Nested schema associated with the property
   */
  private async promptForArrayInputs<T = any>(
    stack: TerraformStack,
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
          stack,
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
   * @param property.name Name of the array property in the parent schema
   * @param property.schema Nested schema associated with the property
   * @param validator Optional validation function used for additional enforcement
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
   * @param property.name Name of the array property in the parent schema
   * @param property.schema Nested schema associated with the property
   * @param validator Optional validation function used for additional enforcement
   */
  private async promptForStringInputs(
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
   * @param stack - A TerraformStack object that's passed through for nested modules to attach to
   * @param provider - A cldctl Provider used to query nested resource items
   * @param property.name - Name of the array property in the parent schema
   * @param property.schema - Nested schema associated with the property
   * @param data - Optional key/value store of values that can be used repeatedly
   * @returns
   */
  private async promptForKeyValueInputs<T extends Record<string, unknown>>(
    stack: TerraformStack,
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
        stack,
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
   * @param stack - A TerraformStack object that's passed through for nested modules to attach to
   * @param provider - A cldctl Provider used to query nested resource items
   * @param property.name - Name of the array property in the parent schema
   * @param property.schema - Nested schema associated with the property
   * @param data - Optional key/value store of values that can be used repeatedly
   */
  private async promptForResourceID<T extends ResourceType>(
    stack: TerraformStack,
    provider: Provider,
    property: { name: T; schema: JSONSchemaType<string> },
    data: Record<string, unknown> = {},
  ): Promise<string> {
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
            ...(service.manage
              ? [
                  new inquirer.Separator(),
                  {
                    value: 'create-new',
                    name: `Create a new ${property.name}`,
                  },
                  new inquirer.Separator(),
                ]
              : []),
          ],
        },
      ],
      data,
    );

    if (answers[property.name as string] === 'create-new') {
      this.log(`Inputs for ${property.name}`);
      const module = await this.promptForNewResourceModule(
        stack as any,
        provider,
        property.name,
        data,
      );
      this.log(`End ${property.name} inputs`);
      return module.module.outputs.id;
    } else {
      return answers[property.name];
    }
  }

  /**
   * Look through all providers and determine if a resource type is creatable
   * @param resourceType The resource type to check
   * @returns Wether or not the resource is creatable
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
      if (provider.resources[resourceType]?.manage?.module) {
        return true;
      }
    }
    return false;
  }

  /**
   * Prompt the user to input property values matching the JSON schema provided
   * @param stack - A TerraformStack object that's passed through for nested modules to attach to
   * @param provider - A cldctl Provider used to query nested resource items
   * @param property.name - Name of the array property in the parent schema
   * @param property.schema - Nested schema associated with the property
   * @param data - Optional key/value store of values that can be used repeatedly
   */
  private async promptForSchemaProperties<T>(
    stack: TerraformStack,
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

    const validators = provider.resources[resourceType]?.manage?.validators;
    const validator = validators
      ? (validators as any)[property.name]
      : undefined;

    if (data[property.name]) {
      return data[property.name] as any;
    } else if (ResourceTypeList.includes(property.name as ResourceType)) {
      const res = (await this.promptForResourceID(
        stack,
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
          stack,
          provider,
          resourceType,
          { name: propertyName, schema: propertySchema },
          data,
        );
      }

      if (property.schema.additionalProperties) {
        res = {
          ...res,
          ...(await this.promptForKeyValueInputs(stack, provider, {
            name: property.name,
            schema,
          }),
          data),
        };
      }

      return res as any;
    } else if (property.schema.type === 'array') {
      return this.promptForArrayInputs(
        stack,
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
  protected async promptForProvider(
    options: {
      provider?: string;
      type?: ResourceType;
      action?: 'list' | 'get' | 'manage';
      message?: string;
    } = {},
  ): Promise<Provider> {
    const providers: Provider[] = [];
    for (const p of await getProviders(this.config.configDir)) {
      if (options.type && p.resources[options.type]) {
        const service = p.resources[options.type]!;
        if (!options.action || (options.action && service[options.action])) {
          providers.push(p);
        }
      } else if (!options.type) {
        providers.push(p);
      }
    }

    const newProviderTitle = 'Add a new set of credentials';

    const res = await inquirer.prompt(
      [
        {
          name: 'provider',
          type: 'list',
          message: options.message || 'Select a set of credentials',
          choices: [
            ...providers.map((p) => ({
              name: `${p.name} (${p.type})`,
              value: p.name,
            })),
            newProviderTitle,
          ],
        },
      ],
      { provider: options.provider },
    );

    if (res.provider === newProviderTitle) {
      return createProvider();
    }

    const provider = providers.find((p) => p.name === res.provider);
    if (!provider) {
      this.error(`Credentials ${res.provider} not found`);
    }

    return provider;
  }

  /**
   * Prompt the user to select a resource type that matches the provider and action specified.
   */
  protected async promptForResourceType(
    provider: Provider,
    action: 'list' | 'get' | 'manage',
    input?: string,
  ): Promise<ResourceType> {
    const resources = provider.getResourceEntries();
    resources.filter(([type, service]) => {
      return service[action] && (!input || type === input);
    });

    if (resources.length === 0) {
      this.error(
        `The cloud provider plugin for ${provider.name} does not support ${action} ${input}s`,
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
   * @param stack - A TerraformStack object that's passed through for nested modules to attach to
   * @param provider - A cldctl Provider used to query nested resource items
   * @param type - The type of resource to create a module for
   * @param data - Optional key/value store of values that can be used repeatedly
   */
  protected async promptForNewResourceModule<
    T extends ResourceType,
    C extends ProviderCredentials,
  >(
    stack: CldCtlTerraformStack,
    provider: Provider<C>,
    type: T,
    data: Record<string, unknown> = {},
  ): Promise<{ module: ResourceModule<T, C>; output: TerraformOutput }> {
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

    const service = provider.resources[type];
    if (!service) {
      this.error(
        `The ${provider.type} provider does not work with ${type} resources`,
      );
    }

    const ModuleConstructor = service.manage?.module;
    if (!ModuleConstructor) {
      this.error(
        `The ${provider.type} provider cannot create ${type} resources`,
      );
    }

    if (service.manage?.presets?.length) {
      const { result } = await inquirer.prompt([
        {
          name: 'result',
          type: 'list',
          message:
            'Please select one of our default configurations or customize the creation of your resource.',
          choices: [
            ...service.manage.presets.map((p) => ({
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

      data = {
        ...data,
        ...result,
      };
    }

    const inputs = await this.promptForSchemaProperties<ResourceInputs[T]>(
      stack,
      provider,
      type,
      {
        name: '',
        schema,
      },
      data,
    );

    return stack.addModule(ModuleConstructor, type, inputs);
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
