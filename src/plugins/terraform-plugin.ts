import {
  ArchitectPlugin,
  PluginArchitecture,
  PluginBinary,
  PluginBundleType,
  PluginOptions,
  PluginPlatform,
} from './plugin-types.ts';
import { execa, ExecaChildProcess } from 'npm:execa';
import * as path from 'https://deno.land/std@0.188.0/path/mod.ts';

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
          'f666aa1388f94c9b86ea01cb884ba53b9132d2cec3d9cac976ad93a2aba901d5',
      },
      {
        platform: PluginPlatform.LINUX,
        architecture: PluginArchitecture.AMD64,
        bundleType: PluginBundleType.ZIP,
        executablePath: 'terraform',
        url: 'https://releases.hashicorp.com/terraform/1.4.6/terraform_1.4.6_linux_amd64.zip',
        sha256:
          'e079db1a8945e39b1f8ba4e513946b3ab9f32bd5a2bdf19b9b186d22c5a3d53b',
      },
      {
        platform: PluginPlatform.DARWIN,
        architecture: PluginArchitecture.ARM64,
        bundleType: PluginBundleType.ZIP,
        executablePath: 'terraform',
        url: 'https://releases.hashicorp.com/terraform/1.4.6/terraform_1.4.6_darwin_arm64.zip',
        sha256:
          '30a2f87298ff9f299452119bd14afaa8d5b000c572f62fa64baf432e35d9dec1',
      },
      {
        platform: PluginPlatform.DARWIN,
        architecture: PluginArchitecture.AMD64,
        bundleType: PluginBundleType.ZIP,
        executablePath: 'terraform',
        url: 'https://releases.hashicorp.com/terraform/1.4.6/terraform_1.4.6_darwin_amd64.zip',
        sha256:
          '5d8332994b86411b049391d31ad1a0785dfb470db8b9c50617de28ddb5d1f25d',
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
          '80480acbfee2e2d0b094f721f7568a40b790603080d6612e19b797a16b8ba82d',
      },
      {
        platform: PluginPlatform.DARWIN,
        architecture: PluginArchitecture.AMD64,
        bundleType: PluginBundleType.ZIP,
        executablePath: 'terraform',
        url: 'https://releases.hashicorp.com/terraform/1.3.2/terraform_1.3.2_darwin_amd64.zip',
        sha256:
          '3639461bbc712dc130913bbe632afb449fce8c0df692429d311e7cb808601901',
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
          'bc3b94b53cdf1be3c4988faa61aad343f48e013928c64bfc6ebeb61657f97baa',
      },
      {
        platform: PluginPlatform.DARWIN,
        architecture: PluginArchitecture.AMD64,
        bundleType: PluginBundleType.ZIP,
        executablePath: 'terraform',
        url: 'https://releases.hashicorp.com/terraform/1.2.9/terraform_1.2.9_darwin_amd64.zip',
        sha256:
          '84a678ece9929cebc34c7a9a1ba287c8b91820b336f4af8437af7feaa0117b7c',
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
    if (Deno.env.get('TEST') === '1') {
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
      cmd.stdout?.pipe(Deno.stdout);
      cmd.stderr?.pipe(Deno.stderr);
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
