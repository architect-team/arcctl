import {
  ArchitectPlugin,
  PluginArchitecture,
  PluginBinary,
  PluginBundleType,
  PluginOptions,
  PluginPlatform,
} from './plugin-types.js';
import { execa, ExecaChildProcess } from 'execa';
import path from 'path';

export type TerraformVersion = '1.4.6' | '1.3.2' | '1.2.9' | 'fake';

export default class TerraformPlugin implements ArchitectPlugin {
  private pluginDirectory = '';
  private binary?: PluginBinary;

  name: string = TerraformPlugin.name;

  versions = {
    '1.4.6': [
      {
        platform: PluginPlatform.WINDOWS,
        architecture: PluginArchitecture.AMD64,
        bundleType: PluginBundleType.ZIP,
        executablePath: 'terraform.exe',
        url: 'https://releases.hashicorp.com/terraform/1.4.6/terraform_1.4.6_windows_amd64.zip',
        sha256:
          '6b0e47fff3392352ecc1264fd5b348fd17b2f2dff1a8dca9933e9bb033fdb498',
      },
      {
        platform: PluginPlatform.LINUX,
        architecture: PluginArchitecture.AMD64,
        bundleType: PluginBundleType.ZIP,
        executablePath: 'terraform',
        url: 'https://releases.hashicorp.com/terraform/1.4.6/terraform_1.4.6_linux_amd64.zip',
        sha256:
          '6372e02a7f04bef9dac4a7a12f4580a0ad96a37b5997e80738e070be330cb11c',
      },
      {
        platform: PluginPlatform.DARWIN,
        architecture: PluginArchitecture.ARM64,
        bundleType: PluginBundleType.ZIP,
        executablePath: 'terraform',
        url: 'https://releases.hashicorp.com/terraform/1.4.6/terraform_1.4.6_darwin_arm64.zip',
        sha256:
          '4e186e1caadad1e86281cb44f552d12f39186ae2ffe5852a525582b62353bcfc',
      },
      {
        platform: PluginPlatform.DARWIN,
        architecture: PluginArchitecture.AMD64,
        bundleType: PluginBundleType.ZIP,
        executablePath: 'terraform',
        url: 'https://releases.hashicorp.com/terraform/1.4.6/terraform_1.4.6_darwin_amd64.zip',
        sha256:
          'b5874e6a2b355f90331e0256737bbeeb85be59e477c32619555e98848b983765',
      },
    ],
    '1.3.2': [
      {
        platform: PluginPlatform.WINDOWS,
        architecture: PluginArchitecture.AMD64,
        bundleType: PluginBundleType.ZIP,
        executablePath: 'terraform.exe',
        url: 'https://releases.hashicorp.com/terraform/1.3.2/terraform_1.3.2_windows_amd64.zip',
        sha256:
          '6b0e47fff3392352ecc1264fd5b348fd17b2f2dff1a8dca9933e9bb033fdb498',
      },
      {
        platform: PluginPlatform.LINUX,
        architecture: PluginArchitecture.AMD64,
        bundleType: PluginBundleType.ZIP,
        executablePath: 'terraform',
        url: 'https://releases.hashicorp.com/terraform/1.3.2/terraform_1.3.2_linux_amd64.zip',
        sha256:
          '6372e02a7f04bef9dac4a7a12f4580a0ad96a37b5997e80738e070be330cb11c',
      },
      {
        platform: PluginPlatform.DARWIN,
        architecture: PluginArchitecture.ARM64,
        bundleType: PluginBundleType.ZIP,
        executablePath: 'terraform',
        url: 'https://releases.hashicorp.com/terraform/1.3.2/terraform_1.3.2_darwin_arm64.zip',
        sha256:
          '4e186e1caadad1e86281cb44f552d12f39186ae2ffe5852a525582b62353bcfc',
      },
      {
        platform: PluginPlatform.DARWIN,
        architecture: PluginArchitecture.AMD64,
        bundleType: PluginBundleType.ZIP,
        executablePath: 'terraform',
        url: 'https://releases.hashicorp.com/terraform/1.3.2/terraform_1.3.2_darwin_amd64.zip',
        sha256:
          'b5874e6a2b355f90331e0256737bbeeb85be59e477c32619555e98848b983765',
      },
    ],
    '1.2.9': [
      {
        platform: PluginPlatform.WINDOWS,
        architecture: PluginArchitecture.AMD64,
        bundleType: PluginBundleType.ZIP,
        executablePath: 'terraform.exe',
        url: 'https://releases.hashicorp.com/terraform/1.2.9/terraform_1.2.9_windows_amd64.zip',
        sha256:
          '1425bbe982251dde58104dab3d41f48a51d8735122bdb3790b3b3686c57ebfa2',
      },
      {
        platform: PluginPlatform.LINUX,
        architecture: PluginArchitecture.AMD64,
        bundleType: PluginBundleType.ZIP,
        executablePath: 'terraform',
        url: 'https://releases.hashicorp.com/terraform/1.2.9/terraform_1.2.9_linux_amd64.zip',
        sha256:
          '0e0fc38641addac17103122e1953a9afad764a90e74daf4ff8ceeba4e362f2fb',
      },
      {
        platform: PluginPlatform.DARWIN,
        architecture: PluginArchitecture.ARM64,
        bundleType: PluginBundleType.ZIP,
        executablePath: 'terraform',
        url: 'https://releases.hashicorp.com/terraform/1.2.9/terraform_1.2.9_darwin_arm64.zip',
        sha256:
          '91f51a352027f338b7673f23ee3c438ca8575933b7f58bfd7a92ffccf552158b',
      },
      {
        platform: PluginPlatform.DARWIN,
        architecture: PluginArchitecture.AMD64,
        bundleType: PluginBundleType.ZIP,
        executablePath: 'terraform',
        url: 'https://releases.hashicorp.com/terraform/1.2.9/terraform_1.2.9_darwin_amd64.zip',
        sha256:
          '2c4d2b425a0680c6a4d65601a5f42f8b5c23e4ccd3332cf649ce14eaa646b967',
      },
    ],
  };

  async setup(pluginDirectory: string, binary: PluginBinary): Promise<void> {
    this.binary = binary;
    this.pluginDirectory = pluginDirectory;
  }

  execNoPromise(
    args: string[],
    opts: PluginOptions,
  ): ExecaChildProcess<string> {
    if (process.env.TEST === '1') {
      return {} as ExecaChildProcess<string>;
    }

    const cmd = execa(
      path.join(this.pluginDirectory, `/${this.binary?.executablePath}`),
      [
        ...(opts.execaOptions?.cwd ? [`-chdir=${opts.execaOptions?.cwd}`] : []),
        ...args,
      ],
      opts.execaOptions,
    );
    if (opts.stdout) {
      cmd.stdout?.pipe(process.stdout);
      cmd.stderr?.pipe(process.stderr);
    }
    return cmd;
  }

  exec(args: string[], opts: PluginOptions): ExecaChildProcess<string> {
    return this.execNoPromise(args, opts);
  }

  async init(cwd: string): Promise<void> {
    await this.exec(['init'], {
      stdout: false,
      execaOptions: {
        cwd: cwd,
      },
    });
  }

  async plan(cwd: string, planFile: string): Promise<string> {
    const cmd = await this.exec(['plan', '--out', planFile], {
      stdout: false,
      execaOptions: {
        cwd: cwd,
      },
    });
    return cmd?.stdout || '';
  }

  apply(cwd: string, planFile: string): ExecaChildProcess<string> {
    return this.execNoPromise(['apply', planFile], {
      stdout: false,
      execaOptions: {
        cwd: cwd,
      },
    });
  }

  async output(cwd: string, id: string): Promise<string> {
    const output = await this.exec(['output', '-json', id], {
      stdout: false,
      execaOptions: {
        cwd: cwd,
      },
    });
    return output!.stdout;
  }

  destroy(cwd: string): ExecaChildProcess<string> {
    return this.execNoPromise(['destroy', '--auto-approve'], {
      stdout: false,
      execaOptions: {
        cwd: cwd,
      },
    });
  }

  async import(
    cwd: string,
    resourceId: string,
    cloudId: string,
  ): Promise<void> {
    await this.exec(['import', resourceId, cloudId], {
      stdout: false,
      execaOptions: {
        cwd: cwd,
      },
    });
  }
}
