import { ResourceModule } from '../@providers/module.js';
import { ResourceInputs, ResourceType } from '@resources/index.js';
import { TerraformOutput, TerraformStack } from 'cdktf';
import { Construct } from 'npm:constructs';

export class CldCtlTerraformStack extends TerraformStack {
  addModule<T extends ResourceType>(
    ModuleConstructor: new (
      scope: Construct,
      id: string,
      inputs: ResourceInputs[T],
    ) => ResourceModule<T, any>,
    id: string,
    inputs: ResourceInputs[T],
  ): { module: ResourceModule<T, any>; output: TerraformOutput } {
    const module = new ModuleConstructor(this, id, inputs);
    const output = new TerraformOutput(this, `${id}-output`, {
      value: module.outputs,
      sensitive: true,
    });
    return { module, output };
  }

  findModules(): ResourceModule<any, any>[] {
    return this.node
      .findAll()
      .filter((child) => child instanceof ResourceModule) as ResourceModule<
      any,
      any
    >[];
  }

  getResourceDisplayNames(): Record<string, string> {
    let res: Record<string, string> = {};

    for (const module of this.findModules()) {
      res = {
        ...res,
        ...module.getDisplayNames(),
      };
    }

    return res;
  }
}
