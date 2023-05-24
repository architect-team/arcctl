import { BaseCommand } from '../base-command.js';
import { ImageRepository } from 'npm:@architect-io/arc-oci';
import { Flags } from '@oclif/core';
import yaml from 'js-yaml';

export class DeployComponentCmd extends BaseCommand {
  static description = 'Deploy a component into an existing environment';

  static args = [
    {
      name: 'tag',
      description: 'Component tag to deploy to the environment',
      required: true,
    },
  ];

  static flags = {
    environment: Flags.string({
      char: 'e',
      description: 'Name of the environment to deploy to',
    }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(DeployComponentCmd);

    try {
      const imageRepository = new ImageRepository(args.tag);
      const component = await this.componentStore.getComponentConfig(args.tag);
      const environmentRecord = await this.environmentStore.getEnvironment(
        args.environment,
      );
    } catch (err: any) {
      this.error(err);
    }
  }
}
