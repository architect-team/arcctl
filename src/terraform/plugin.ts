import {
  ArchitectPlugin,
  PluginArchitecture,
  PluginBinary,
  PluginBundleType,
  PluginOptions,
  PluginPlatform,
} from '../plugins/plugin-types.ts';
import { ExecaChildProcess, execa } from 'execa';
import path from 'path';

export type TerraformVersion = '1.4.5' | '1.3.2' | '1.2.9';

export class TerraformPlugin implements ArchitectPlugin {
  readonly name = TerraformPlugin.name;
  readonly versions = {
    '1.4.5': [
      {
        platform: PluginPlatform.WINDOWS,
        architecture: PluginArchitecture.AMD64,
        bundleType: PluginBundleType.ZIP,
        executablePath: 'terraform.exe',
        url: 'https://releases.hashicorp.com/terraform/1.4.5/terraform_1.4.5_windows_amd64.zip',
        sha256:
          '4d6c831225e3ca058b4665cd7ea144851963427413f61f00acc35eb635f51055',
      },
      {
        platform: PluginPlatform.LINUX,
        architecture: PluginArchitecture.AMD64,
        bundleType: PluginBundleType.ZIP,
        executablePath: 'terraform',
        url: 'https://releases.hashicorp.com/terraform/1.4.5/terraform_1.4.5_linux_amd64.zip',
        sha256:
          'ce10e941cd11554b15a189cd00191c05abc20dff865599d361bdb863c5f406a9',
      },
      {
        platform: PluginPlatform.DARWIN,
        architecture: PluginArchitecture.ARM64,
        bundleType: PluginBundleType.ZIP,
        executablePath: 'terraform',
        url: 'https://releases.hashicorp.com/terraform/1.4.5/terraform_1.4.5_darwin_arm64.zip',
        sha256:
          '7104d9d13632aa61b494a349c589048d21bd550e579404c3a41c4932e4d6aa97',
      },
      {
        platform: PluginPlatform.DARWIN,
        architecture: PluginArchitecture.AMD64,
        bundleType: PluginBundleType.ZIP,
        executablePath: 'terraform',
        url: 'https://releases.hashicorp.com/terraform/1.4.5/terraform_1.4.5_darwin_amd64.zip',
        sha256:
          '808e54d826737e9a0ca79bbe29330e50d3622bbeeb26066c63b371a291731711',
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

  private binaryDir?: string;
  private binary?: PluginBinary;

  async setup(binaryDir: string, binary: PluginBinary): Promise<void> {
    this.binaryDir = binaryDir;
    this.binary = binary;
  }

  exec(args: string[], opts?: PluginOptions): ExecaChildProcess<string> {
    if (!this.binary || !this.binaryDir) {
      throw new Error(`Terraform plugin not loaded. Try running setup().`);
    }

    const binaryPath = path.join(this.binaryDir, this.binary.executablePath);
    return execa(binaryPath, args, opts?.execaOptions);
  }
}
