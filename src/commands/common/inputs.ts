import {
  Confirm,
  Input,
  InputOptions,
  Number,
  NumberOptions,
  Secret,
  SecretOptions,
  Select,
  SelectOptions,
} from 'cliffy/prompt/mod.ts';

export class Inputs {
  private static _isInteractiveShell = Deno.isatty(Deno.stdin.rid);
  /**
   * Throw an error if this shell is non interactive
   */
  public static assertInteractiveShell(message?: string) {
    if (!this._isInteractiveShell) {
      throw new Error(
        message ||
          'This command requires an interactive shell. Please check the docs for how to pass in all required values as flags/arguments',
      );
    }
  }

  public static isInteractiveShell(): boolean {
    return this._isInteractiveShell;
  }

  /**
   * Helper method to prompt users to confirm they're ready to proceed
   */
  public static async promptForContinuation(message: string): Promise<boolean> {
    return this.promptBoolean(message);
  }

  /**
   * Helper method to ask the user a message and return a string
   */
  public static async promptString(options: string | InputOptions): Promise<string> {
    this.assertInteractiveShell();
    return await Input.prompt(options);
  }

  /**
   * Helper method to ask the user a message and return a boolean
   */
  public static async promptBoolean(message: string): Promise<boolean> {
    this.assertInteractiveShell();
    return await Confirm.prompt(message);
  }

  /**
   * Helper method to ask the user a message and return a number
   */
  public static async promptNumber(options: string | NumberOptions): Promise<number> {
    this.assertInteractiveShell();
    return await Number.prompt(options);
  }

  /**
   * Ask the user to input a secret
   * @param options Message or options for message to ask the user
   * @returns A string containing the users input
   */
  public static async promptForSecret(options: string | SecretOptions): Promise<string> {
    this.assertInteractiveShell();
    return await Secret.prompt(options);
  }

  /**
   * Ask the user to select from a list of options
   * @param options Options for the user to select from
   * @returns A string containing the users input
   */
  public static async promptSelection(options: SelectOptions): Promise<string> {
    this.assertInteractiveShell();
    return Select.prompt(options);
  }
}
