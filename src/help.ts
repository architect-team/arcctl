// import { Help, Interfaces } from '@oclif/core';
// import { createTable } from './utils/table.ts';

// TODO(tyler): Use root help text

// export default class CustomHelp extends Help {
//   constructor(
//     config: Interfaces.Config,
//     opts: Partial<Interfaces.HelpOptions> = {},
//   ) {
//     super(config, opts);
//   }

//   generateRootHelp(): void {
//     console.log(this.formatRoot());
//     console.log('\nCOMMANDS');

//     const table = createTable();
//     const seenDisplayNames: string[] = [];
//     for (const command of this.config.commands) {
//       const baseCommand = command as any;
//       if (
//         !baseCommand.displayName ||
//         seenDisplayNames.includes(baseCommand.displayName)
//       ) {
//         continue;
//       }
//       seenDisplayNames.push(baseCommand.displayName);
//       table.push([`  ${baseCommand.displayName}`, baseCommand.description]);
//     }
//     console.log(table.toString());
//     console.log(`
// GETTING STARTED

// To get started using cldctl first you need to add your credentials for one of our supported cloud providers.
// $ cldctl add credentials

// Once that is done you can start creating your first resource
// $ cldctl create kubernetesCluster
//     `);
//   }

//   async showHelp(args: string[]): Promise<void> {
//     if (args.length === 1 && args[0].toLowerCase() === '--help') {
//       return this.generateRootHelp();
//     }
//     super.showHelp(args);
//   }
// }
