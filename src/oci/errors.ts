export class InvalidImageFormat extends Error {
  constructor(ref: string) {
    super(`Incorrectly formatted component ref: ${ref}`);
  }
}
