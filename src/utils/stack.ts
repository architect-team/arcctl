import { ResourceModule, ResourceModuleConstructor, ResourceModuleOptions } from '../@providers/index.ts';
import { ResourceType } from '../@resources/index.ts';
import { TerraformOutput, TerraformStack } from 'cdktf';

export class CldCtlTerraformStack extends TerraformStack {
  addModule<T extends ResourceType>(
    ModuleConstructor: ResourceModuleConstructor<T, any>,
    options: ResourceModuleOptions<T>,
  ): { module: ResourceModule<T, any>; output: TerraformOutput } {
    const module = new ModuleConstructor(this, options);
    const output = new TerraformOutput(this, `${options.id}-output`, {
      value: module.outputs,
      sensitive: true,
    });
    return { module, output };
  }

  findModules(): ResourceModule<any, any>[] {
    return this.node.findAll().filter((child) => child instanceof ResourceModule) as unknown as ResourceModule<
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
