import { ResourceInputs, ResourceType } from '../@resources/types.ts';

export type CloudNodeOptions<T extends ResourceType> = {
  name: string;
  inputs: ResourceInputs[T];
  component?: string;
  environment?: string;
};

export class CloudNode<T extends ResourceType = ResourceType> {
  name: string;
  inputs: ResourceInputs[T];
  component?: string;
  environment?: string;

  static genResourceId(options: {
    name: string;
    component?: string;
    environment?: string;
  }): string {
    let res = options.name;

    if (options.component && options.environment?.includes('/')) {
      const [env_account] = options.environment.split('/');
      const [component_account, component_name] = options.component.split('/');
      if (component_account === env_account) {
        res = `${component_name}/${res}`;
      }
    } else if (options.component) {
      res = `${options.component}/${res}`;
    }

    return res;
  }

  static genId(options: {
    type: ResourceType;
    name: string;
    component?: string;
    environment?: string;
  }): string {
    return CloudNode.genResourceId({
      name: `${options.type}/${options.name}`,
      component: options.component,
      environment: options.environment,
    });
  }

  constructor(options: CloudNodeOptions<T>) {
    this.component = options.component;
    this.environment = options.environment;
    this.name = options.name;
    this.inputs = options.inputs;
  }

  get account(): string | undefined {
    return this.inputs.account;
  }

  get type(): ResourceType {
    return this.inputs.type;
  }

  get id(): string {
    return CloudNode.genId(this);
  }

  get resource_id(): string {
    return CloudNode.genResourceId(this);
  }
}
