import { Command } from 'cliffy/command/mod.ts';
import * as path from 'std/path/mod.ts';
import { ComponentStore } from '../component-store/index.ts';
import { DatacenterStore } from '../datacenters/index.ts';
import { EnvironmentStore } from '../environments/index.ts';
import ArcCtlConfig from '../utils/config.ts';
import { DatacenterUtils } from './common/datacenter.ts';
import { EnvironmentUtils } from './common/environment.ts';
import { InfraRenderer } from './common/infra-renderer.ts';

export type GlobalOptions = {
  configHome?: string;
};

export function BaseCommand() {
  const command = new Command()
    .name('arcctl')
    .description(
      'Create and manage cloud applications and infrastructure with twin frameworks: Components & Datacenters',
    )
    .globalEnv('XDG_CONFIG_HOME=<value:string>', 'Configuration folder location.', {
      prefix: 'XDG_',
    })
    .action(() => {
      command.showHelp();
    });

  return command;
}

export class CommandHelper {
  private infra_renderer: InfraRenderer;
  private datacenter_utils: DatacenterUtils;
  private environment_utils: EnvironmentUtils;

  constructor(
    options: GlobalOptions,
  ) {
    ArcCtlConfig.load(options.configHome);
    this.infra_renderer = new InfraRenderer();
    this.datacenter_utils = new DatacenterUtils(
      this.datacenterStore,
    );
    this.environment_utils = new EnvironmentUtils(this.environmentStore);
  }

  get componentStore(): ComponentStore {
    const config_dir = ArcCtlConfig.getConfigDirectory();
    return new ComponentStore(path.join(config_dir, 'component-store'));
  }

  get datacenterStore(): DatacenterStore {
    return new DatacenterStore({
      backendConfig: ArcCtlConfig.getStateBackendConfig(),
      cache_dir: path.join(ArcCtlConfig.getConfigDirectory(), 'datacenter-store'),
    });
  }

  get environmentStore(): EnvironmentStore {
    return new EnvironmentStore(ArcCtlConfig.getStateBackendConfig());
  }

  get infraRenderer(): InfraRenderer {
    return this.infra_renderer;
  }

  get datacenterUtils(): DatacenterUtils {
    return this.datacenter_utils;
  }

  get environmentUtils(): EnvironmentUtils {
    return this.environment_utils;
  }
}
