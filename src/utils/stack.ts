import { TerraformOutput, TerraformStack } from 'cdktf';
import {
  ProviderCredentials,
  ResourceModule,
  ResourceModuleConstructor,
  ResourceModuleOptions,
} from '../@providers/index.ts';
import { ResourceType } from '../@resources/index.ts';

export class CldCtlTerraformStack extends TerraformStack {
  addModule<T extends ResourceType, C extends ProviderCredentials>(
    ModuleConstructor: ResourceModuleConstructor<T, C>,
    options: ResourceModuleOptions<T, C>,
  ): { module: ResourceModule<T, C>; output: TerraformOutput } {
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
