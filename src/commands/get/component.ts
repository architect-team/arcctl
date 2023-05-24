import { BaseCommand } from '../../base-command.ts';
import yaml from 'js-yaml';

export class GetComponentManifestCmd extends BaseCommand {
  static description = 'Retrieve the component matching the specified tag';

  static args = [
    {
      name: 'tag',
      description: 'Tag of the component to retrieve',
      required: true,
    },
  ];

  async run(): Promise<void> {
    const { args } = await this.parse(GetComponentManifestCmd);

    try {
      const component = await this.componentStore.getComponentConfig(args.tag);
      this.log(yaml.dump(component));
    } catch (err: any) {
      this.error(err);
    }
  }
}
