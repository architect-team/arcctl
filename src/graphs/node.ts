export type GraphNodeOptions<I> = {
  name: string;
  inputs: I;
  component?: string;
  environment?: string;
};

export abstract class GraphNode<I = any> {
  name: string;
  inputs: I;
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

  constructor(options: GraphNodeOptions<I>) {
    this.component = options.component;
    this.environment = options.environment;
    this.name = options.name;
    this.inputs = options.inputs;
  }

  abstract getId(): string;
}
