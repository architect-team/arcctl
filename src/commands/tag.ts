import { BaseCommand } from '../base-command.js';
import { ImageRepository } from 'npm:@architect-io/arc-oci';
import { execa } from 'execa';
import path from 'path';

export class TagComponentCmd extends BaseCommand {
  static description = 'Tag a component and its associated build artifacts';

  static args = [
    {
      name: 'source',
      description: 'Source tag to map to the new tag',
      required: true,
    },
    {
      name: 'target',
      description: 'Target tag to apply to the component',
      required: true,
    },
  ];

  async run(): Promise<void> {
    const { args } = await this.parse(TagComponentCmd);

    try {
      const component = await this.componentStore.getComponentConfig(
        args.source,
      );

      component.tag(async (sourceRef: string, targetName: string) => {
        const imageRepository = new ImageRepository(args.target);
        const suffix = imageRepository.tag ? ':' + imageRepository.tag : '';
        const targetRef = path.join(
          imageRepository.registry,
          `${targetName}${suffix}`,
        );

        await execa('docker', ['tag', sourceRef, targetRef]);
        return targetRef;
      });

      this.componentStore.tag(args.source, args.target);
      this.log(`Tagged: ${args.target}`);
    } catch (err: any) {
      this.error(err);
    }
  }
}
