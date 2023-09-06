import { Command } from 'cliffy/command/mod.ts';
import * as path from 'std/path/mod.ts';
import { ProviderStore } from '../@providers/index.ts';
import { ComponentStore } from '../component-store/index.ts';
import { DatacenterStore } from '../datacenters/index.ts';
import { EnvironmentStore } from '../environments/index.ts';
import ArcCtlConfig from '../utils/config.ts';
import { ArcctlProviderStore } from '../utils/provider-store.ts';
import { AccountInputUtils } from './common/account-inputs.ts';
import { DatacenterUtils } from './common/datacenter.ts';
import { EnvironmentUtils } from './common/environment.ts';
import { PipelineRenderer } from './common/pipeline-renderer.ts';
import { ResourceInputUtils } from './common/resource-inputs.ts';

export type GlobalOptions = {
  configHome?: string;
};

export function BaseCommand() {
  return new Command().globalEnv('XDG_CONFIG_HOME=<value:string>', 'Configuration folder location.', {
    prefix: 'XDG_',
  });
}

export class CommandHelper {
  public readonly providerStore: ProviderStore;
  private account_input_utils: AccountInputUtils;
  private resource_input_utils: ResourceInputUtils;
  private pipeline_renderer: PipelineRenderer;
  private datacenter_utils: DatacenterUtils;
  private environment_utils: EnvironmentUtils;

  constructor(
    options: GlobalOptions,
  ) {
    ArcCtlConfig.load(options.configHome);
    this.providerStore = new ArcctlProviderStore(ArcCtlConfig.getStateBackend());
    this.account_input_utils = new AccountInputUtils(this.providerStore);
    this.resource_input_utils = new ResourceInputUtils();
    this.pipeline_renderer = new PipelineRenderer();
    this.datacenter_utils = new DatacenterUtils(
      this.datacenterStore,
      this.resourceInputUtils,
      this.providerStore,
      this.account_input_utils,
    );
    this.environment_utils = new EnvironmentUtils(this.environmentStore, this.providerStore);
  }

  get componentStore(): ComponentStore {
    const config_dir = ArcCtlConfig.getConfigDirectory();
    return new ComponentStore(path.join(config_dir, 'component-store'));
  }

  get datacenterStore(): DatacenterStore {
    const config_dir = ArcCtlConfig.getConfigDirectory();
    return new DatacenterStore(ArcCtlConfig.getStateBackend(), path.join(config_dir, 'datacenter-store'));
  }

  get environmentStore(): EnvironmentStore {
    return new EnvironmentStore(ArcCtlConfig.getStateBackend());
  }

  get accountInputUtils(): AccountInputUtils {
    return this.account_input_utils;
  }

  get resourceInputUtils(): ResourceInputUtils {
    return this.resource_input_utils;
  }

  get pipelineRenderer(): PipelineRenderer {
    return this.pipeline_renderer;
  }

  get datacenterUtils(): DatacenterUtils {
    return this.datacenter_utils;
  }

  get environmentUtils(): EnvironmentUtils {
    return this.environment_utils;
  }
}
