export class VariableMergingDisabledError extends Error {
  constructor(name: string, additionalValues: string[], component?: string) {
    super(
      `The secret, ${name} in ${component} is not configured to merge values, but has been provided with values to merge: ${
        additionalValues.join(', ')
      }}`,
    );
  }
}
