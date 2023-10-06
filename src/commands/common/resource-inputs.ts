import { JSONSchemaType } from 'ajv';
import { Input, Number as NumberPrompt, Select } from 'cliffy/prompt/mod.ts';
import { deepMerge } from 'std/collections/deep_merge.ts';
import * as path from 'std/path/mod.ts';
import { WritableResourceService } from '../../@providers/base.service.ts';
import { Provider } from '../../@providers/index.ts';
import { ResourceType, ResourceTypeList } from '../../@resources/index.ts';
import { CloudGraph, CloudNode } from '../../app-graph/index.ts';
import { Inputs } from './inputs.ts';

export class ResourceInputUtils {
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
        if (!(typeof value === 'number' || (!!value && !isNaN(Number(value))))) {
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
        } else if (property.schema.minimum && value && number < property.schema.minimum) {
          return `${property.name} must be greater than ${property.schema.minimum}`;
        } else if (property.schema.maximum && value && number > property.schema.maximum) {
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

    while (await Inputs.promptForContinuation(`Would you like to add a key/value pair to ${property.name}?`)) {
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
  public async promptForResourceID(
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
      const node = await this.promptForNewResource(graph, provider, property.name, data);
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
      schema = schema.definitions[schema.$ref.replace('#/definitions/', '')] as JSONSchemaType<any>;
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
      for (const [propertyName, propertySchema] of Object.entries<any>(schema.properties)) {
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
   * Prompt the user to select a resource type that matches the provider and action specified.
   */
  public async promptForResourceType(
    provider: Provider,
    action: 'list' | 'get' | 'create' | 'update' | 'delete',
    input?: string,
    optional?: boolean,
  ): Promise<ResourceType> {
    const resources = provider.getResourceEntries().filter(([type, service]) => {
      return (action in service || 'construct' in service) && (!input || type === input);
    });

    if (resources.length === 0) {
      console.error(`The cloud provider ${provider.type} cannot ${action} ${input}s`);
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
    const schemaPath = path.join(__dirname, '../../@resources', type, './inputs.schema.json');
    const schemaString = await Deno.readTextFile(schemaPath);
    let schema = JSON.parse(schemaString);
    if (schema.$ref && schema.definitions) {
      schema = schema.definitions[schema.$ref.replace('#/definitions/', '')];
    }

    const service = account.resources[type];
    if (!service) {
      console.error(`The ${account.type} provider does not work with ${type} resources`);
      Deno.exit(1);
    }

    if (!('construct' in service) && !('create' in service)) {
      console.error(`The ${account.type} provider cannot create ${type} resources`);
      Deno.exit(1);
    }

    const writableService = service as unknown as WritableResourceService<T, any>;
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
}
