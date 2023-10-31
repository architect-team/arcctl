import { ErrorObject } from 'https://esm.sh/v124/ajv@8.12.0';
import { ResourceType } from '../../@resources/index.ts';

export class DuplicateModuleNameError extends Error {
  constructor(moduleName: string) {
    super(`Duplicate module name: ${moduleName}`);
  }
}

export class InvalidModuleReference extends Error {
  constructor(sourceModuleName: string, targetModuleName: string) {
    super(`Invalid module name, ${targetModuleName}, Referenced by the ${sourceModuleName} module.`);
  }
}

export class InvalidOutputProperties extends Error {
  constructor(type: ResourceType, errors: ErrorObject[]) {
    super(`Invalid output properties for the ${type} hook: [${errors.map((err) => err.message).join(', ')}]`);
  }
}

export class MissingResourceHook extends Error {
  constructor(from: string, to: string) {
    super(`No matching hook found for ${to} (required by ${from}).`);
  }
}

export class ModuleReferencesNotAllowedInWhenClause extends Error {
  constructor() {
    super(
      `Cross module references are not allowed in when clauses`,
    );
  }
}
