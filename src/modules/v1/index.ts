import { DatacenterModule } from '../module.ts';

export default class DatacenterModuleV1 extends DatacenterModule {
  /**
   * Dockerfile to use to build the resource
   *
   * @default "Dockerfile"
   */
  dockerfile?: string;

  /**
   * Command that should be used to setup the module workspace
   *
   * @example "pulumi login --local && pulumi stack init --stack module"
   */
  init?: string | string[];

  /**
   * Command used to generate a preview of changes to apply
   *
   * @example "pulumi preview --stack module"
   */
  plan?: string | string[];

  /**
   * Command used to import state into the module. The statefile address is in the environment variable, $STATE_FILE.
   *
   * @example "pulumi stack import --stack module --file $STATE_FILE"
   */
  import?: string | string[];

  /**
   * Command used to export the module state. The statefile address is in the environment variable, $STATE_FILE.
   *
   * @example "pulumi stack export --stack module --file $STATE_FILE"
   */
  export?: string | string[];

  /**
   * Command to run to dump the module outputs as json. Contents should be written to $OUTPUT_FILE.
   *
   * @example "pulumi stack output --stack module --show-secrets --json > $OUTPUT_FILE"
   */
  outputs!: string | string[];

  /**
   * The command to run to create or update the resources the module controls
   *
   * @example "pulumi up --stack module"
   */
  apply!: string | string[];

  /**
   * The command to run to destroy the module
   *
   * @example "pulumi destroy --stack module"
   */
  destroy!: string | string[];

  constructor(data: any) {
    super();
    Object.assign(this, data);
  }

  getDockerfile(): string | undefined {
    return this.dockerfile;
  }

  getInitCommand(): string[] | undefined {
    return Array.isArray(this.init) ? this.init : this.init?.split(' ');
  }

  getPlanCommand(): string[] | undefined {
    return Array.isArray(this.plan) ? this.plan : this.plan?.split(' ');
  }

  getImportCommand(): string[] | undefined {
    return Array.isArray(this.import) ? this.import : this.import?.split(' ');
  }

  getExportCommand(): string[] | undefined {
    return Array.isArray(this.export) ? this.export : this.export?.split(' ');
  }

  getOutputsCommand(): string[] {
    return Array.isArray(this.outputs) ? this.outputs : this.outputs.split(' ');
  }

  getApplyCommand(): string[] {
    return Array.isArray(this.apply) ? this.apply : this.apply.split(' ');
  }

  getDestroyCommand(): string[] {
    return Array.isArray(this.destroy) ? this.destroy : this.destroy.split(' ');
  }
}
