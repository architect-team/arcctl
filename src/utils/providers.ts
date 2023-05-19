import { Provider } from '../@providers/provider.js';
import { SupportedProviders } from '../@providers/supported-providers.js';
import CloudCtlConfig from './config.js';
import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';

export const saveProvider = async (
  provider: Provider,
  configDir?: string,
): Promise<void> => {
  configDir = configDir || CloudCtlConfig.getConfigDirectory();
  const allProviders = await getProviders(configDir);
  const foundIndex = allProviders.findIndex((p) => p.name === provider.name);
  if (foundIndex >= 0) {
    allProviders[foundIndex] = provider;
  } else {
    allProviders.push(provider);
  }
  await saveProviders(configDir, allProviders);
};

export const deleteProvider = async (
  name: string,
  configDir?: string,
): Promise<void> => {
  configDir = configDir || CloudCtlConfig.getConfigDirectory();
  const allProviders = await getProviders(configDir);
  const foundIndex = allProviders.findIndex((p) => p.name === name);
  if (foundIndex >= 0) {
    allProviders.splice(foundIndex, 1);
  } else {
    throw new Error(
      'Unable to delete the provider because it cannot be found.',
    );
  }
  await saveProviders(configDir, allProviders);
};

export const saveFile =
  (configDir?: string) =>
  (name: string, content: string): string => {
    configDir = configDir || CloudCtlConfig.getConfigDirectory();
    const filePath = path.join(configDir, name);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
    return filePath;
  };

export const getProviders = async (configDir?: string): Promise<Provider[]> => {
  configDir = configDir || CloudCtlConfig.getConfigDirectory();
  const providersConfigFile = path.join(configDir, 'providers.json');
  const fileContents = await fs.promises
    .readFile(providersConfigFile, 'utf8')
    .catch(() => '[]');
  const rawProviders = JSON.parse(fileContents);

  const providers: Provider[] = [];
  for (const raw of rawProviders) {
    const type = raw.type as keyof typeof SupportedProviders;
    try {
      providers.push(
        new SupportedProviders[type](
          raw.name,
          raw.credentials,
          saveFile(path.join(configDir, raw.name)),
        ),
      );
    } catch (error) {
      // This is usually do to a bad type and is not a real error
    }
  }

  return providers;
};

let allProviders: Provider[] | undefined;
const doesProviderExist = async (name: string): Promise<boolean> => {
  if (!allProviders) {
    allProviders = await getProviders(CloudCtlConfig.getConfigDirectory());
  }
  return allProviders.some((p) => p.name === name);
};

export const createProvider = async (
  name?: string,
  type?: string,
): Promise<Provider> => {
  const providers = Object.keys(SupportedProviders);
  if (name && (await doesProviderExist(name))) {
    console.log(`A set of credentials with the name ${name} already exists.`);
    name = undefined;
  }
  const res = await inquirer.prompt(
    [
      {
        type: 'input',
        name: 'name',
        message: 'What would you like to name the credentials?',
        validate: async (input: string) => {
          if (await doesProviderExist(input)) {
            return 'A set of credentials with that name already exists.';
          }
          return true;
        },
      },
      {
        type: 'list',
        name: 'type',
        message:
          'What type of provider are you registering the credentials for?',
        choices: providers,
      },
    ],
    { name, type },
  );

  const providerType = res.type as keyof typeof SupportedProviders;
  const credentialSchema = SupportedProviders[providerType].CredentialsSchema;
  const credentials = await inquirer.prompt(
    Object.entries(credentialSchema.properties).map(([key, value]) => ({
      name: key,
      type: 'password',
      message: key,
      required: !(value as any).default,
      default: (value as any).default,
    })),
  );

  const allProviders = await getProviders(CloudCtlConfig.getConfigDirectory());
  const provider = new SupportedProviders[providerType](
    res.name,
    credentials,
    saveFile(CloudCtlConfig.getConfigDirectory()),
  );
  const validCredentials = await provider.testCredentials();
  if (!validCredentials) {
    throw new Error('Invalid credentials');
  }

  const existingIndex = allProviders.findIndex((p) => p.name === provider.name);
  if (existingIndex >= 0) {
    allProviders.splice(existingIndex, 1, provider);
  } else {
    allProviders.push(provider);
  }

  await saveProviders(CloudCtlConfig.getConfigDirectory(), allProviders);
  return provider;
};

export const saveProviders = async (
  configDir: string,
  providers: Provider[],
): Promise<void> => {
  const providersConfigFile = path.join(configDir, 'providers.json');
  await fs.promises.mkdir(path.dirname(providersConfigFile), {
    recursive: true,
  });
  await fs.promises.writeFile(
    providersConfigFile,
    JSON.stringify(providers, null, 2),
  );
};
