import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule } from '../../module.ts';
import { Service } from '../.gen/providers/docker/service/index.ts';
import { DockerCredentials } from '../credentials.ts';
import { Construct } from 'constructs';

export class DockerDeploymentModule extends ResourceModule<
  'deployment',
  DockerCredentials
> {
  private service: Service;
  outputs: ResourceOutputs['deployment'];

  constructor(
    scope: Construct,
    id: string,
    inputs: ResourceInputs['deployment'],
  ) {
    super(scope, id, inputs);

    const stringEnvVars: Record<string, string> = {};
    for (const [key, value] of Object.entries(inputs.environment || {})) {
      stringEnvVars[key] = String(value);
    }

    this.service = new Service(this, inputs.name, {
      name: inputs.name,
      taskSpec: {
        runtime: 'container',
        networksAdvanced: inputs.namespace ? [{ name: inputs.namespace }] : undefined,
        containerSpec: {
          image: inputs.image,
          env: stringEnvVars,
          command: typeof inputs.command === 'string' ? inputs.command.split(' ') : inputs.command,
          mounts: inputs.volume_mounts.map((mount) => ({
            target: mount.mount_path,
            type: 'volume',
            readOnly: mount.readonly,
            source: mount.volume,
          })),
        },
      },
    });

    this.outputs = {
      id: this.service.id,
    };
  }

  async genImports(
    credentials: DockerCredentials,
    resourceId: string,
  ): Promise<Record<string, string>> {
    return {
      [this.getResourceRef(this.service)]: resourceId,
    };
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.service)]: 'Deployment',
    };
  }
}
