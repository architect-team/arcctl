export type DatacenterModuleCommands = {
  init?: string[];
  plan?: string[];
  import?: string[];
  export?: string[];
  apply: string[];
  destroy: string[];
  outputs: string[];
};

export abstract class DatacenterModule {
  abstract getDockerfile(): string | undefined;
  abstract getInitCommand(): string[] | undefined;
  abstract getPlanCommand(): string[] | undefined;
  abstract getImportCommand(): string[] | undefined;
  abstract getExportCommand(): string[] | undefined;
  abstract getOutputsCommand(): string[];
  abstract getApplyCommand(): string[];
  abstract getDestroyCommand(): string[];

  static fromLabels(labels: Record<string, string>): DatacenterModuleCommands {
    const commands: DatacenterModuleCommands = {
      apply: [],
      destroy: [],
      outputs: [],
    };

    Object.entries(labels).forEach(([key, value]) => {
      if (key === 'io.architect.module.init') {
        commands.init = value.split(' ');
      } else if (key === 'io.architect.module.plan') {
        commands.plan = value.split(' ');
      } else if (key === 'io.architect.module.import') {
        commands.import = value.split(' ');
      } else if (key === 'io.architect.module.export') {
        commands.export = value.split(' ');
      } else if (key === 'io.architect.module.apply') {
        commands.apply = value.split(' ');
      } else if (key === 'io.architect.module.destroy') {
        commands.destroy = value.split(' ');
      } else if (key === 'io.architect.module.outputs') {
        commands.outputs = value.split(' ');
      }
    });

    return commands;
  }

  labels(): Record<string, string> {
    const labels: Record<string, string> = {
      'io.architect.module.destroy': this.getDestroyCommand().join(' '),
      'io.architect.module.apply': this.getApplyCommand().join(' '),
      'io.architect.module.outputs': this.getOutputsCommand().join(' '),
    };

    if (this.getInitCommand()) {
      labels['io.architect.module.init'] = this.getInitCommand()!.join(' ');
    }

    if (this.getPlanCommand()) {
      labels['io.architect.module.plan'] = this.getPlanCommand()!.join(' ');
    }

    if (this.getImportCommand()) {
      labels['io.architect.module.import'] = this.getImportCommand()!.join(' ');
    }

    if (this.getExportCommand()) {
      labels['io.architect.module.export'] = this.getExportCommand()!.join(' ');
    }

    return labels;
  }
}
