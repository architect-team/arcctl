import { assertArrayIncludes, assertEquals, assertThrows } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';
import { ParsedVariablesMetadata, ParsedVariablesType } from '../../datacenters/index.ts';
import { CommandHelper } from '../base-command.ts';

class TestCommandHelper extends CommandHelper {
  public sortVariablesPublic(
    variables: ParsedVariablesType,
  ): { name: string; metadata: ParsedVariablesMetadata; dependencies: Set<string> }[] {
    return this.sortVariables(variables);
  }
}

describe('CommandHelper methods', () => {
  it('correctly sorts no order necessary', () => {
    const command_helper = new TestCommandHelper({});

    const variables: ParsedVariablesType = {
      var1: {
        type: 'region',
      },
      var2: {
        type: 'arcctlAccount',
        provider: 'digitalocean',
      },
    };

    const result = command_helper.sortVariablesPublic(variables);
    // Order doesn't matter here, neither relies on each other
    assertArrayIncludes(result, [
      {
        name: 'var1',
        metadata: variables.var1,
        dependencies: new Set(),
      },
      {
        name: 'var2',
        metadata: variables.var2,
        dependencies: new Set(),
      },
    ]);
  });

  it('correctly sorts a single dependnecy', () => {
    const command_helper = new TestCommandHelper({});

    const variables: ParsedVariablesType = {
      var1: {
        type: 'region',
        arcctlAccount: '${{ variables.var2 }}',
        dependant_variables: [{ key: 'arcctlAccount', value: 'var2' }],
      },
      var2: {
        type: 'arcctlAccount',
        provider: 'digitalocean',
      },
    };

    const result = command_helper.sortVariablesPublic(variables);
    // Var2 comes before Var1 in prompting order
    assertEquals(result, [
      {
        name: 'var2',
        metadata: variables.var2,
        dependencies: new Set(),
      },
      {
        name: 'var1',
        metadata: variables.var1,
        dependencies: new Set(['var2']),
      },
    ]);
  });

  it('correctly sorts variables with dependency chain', () => {
    const command_helper = new TestCommandHelper({});

    const variables: ParsedVariablesType = {
      var1: {
        type: 'region',
        arcctlAccount: '${{ variables.var2 }}',
        dependant_variables: [{ key: 'arcctlAccount', value: 'var2' }],
      },
      var2: {
        type: 'arcctlAccount',
        provider: '${{ variables.var3 }}',
        dependant_variables: [{ key: 'provider', value: 'var3' }],
      },
      var3: {
        type: 'string',
      },
    };

    const result = command_helper.sortVariablesPublic(variables);
    // Var2 comes before Var1, var3 comes before var2 in prompting order
    assertEquals(result, [
      {
        name: 'var3',
        metadata: variables.var3,
        dependencies: new Set(),
      },
      {
        name: 'var2',
        metadata: variables.var2,
        dependencies: new Set(['var3']),
      },
      {
        name: 'var1',
        metadata: variables.var1,
        dependencies: new Set(['var2']),
      },
    ]);
  });

  it('correctly sorts variables with multiple dependencies', () => {
    const command_helper = new TestCommandHelper({});

    const variables: ParsedVariablesType = {
      var1: {
        type: 'string',
      },
      var2: {
        type: 'string',
      },
      var3: {
        type: 'arcctlAccount',
        provider: '${{ variables.var1 }}',
        region: '${{ variables.var2 }}',
        dependant_variables: [{ key: 'provider', value: 'var1' }, { key: 'region', value: 'var2' }],
      },
    };

    const result = command_helper.sortVariablesPublic(variables);
    // var1 and var2 can be in any order, but are both before var3
    assertEquals(result.length, 3);
    assertArrayIncludes([result[0], result[1]], [
      {
        name: 'var1',
        metadata: variables.var1,
        dependencies: new Set(),
      },
      {
        name: 'var2',
        metadata: variables.var2,
        dependencies: new Set(),
      },
    ]);
    // Var3 relies on var1, var2 and must be last
    assertEquals(result[2], {
      name: 'var3',
      metadata: variables.var3,
      dependencies: new Set(['var1', 'var2']),
    });
  });

  it('correctly throws error when variable dependencies are circular', () => {
    const command_helper = new TestCommandHelper({});

    const variables: ParsedVariablesType = {
      var1: {
        type: 'string',
        provider: '${{ variables.var2 }}',
        dependant_variables: [{ key: 'provider', value: 'var2' }],
      },
      var2: {
        type: 'string',
        provider: '${{ variables.var1 }}',
        dependant_variables: [{ key: 'provider', value: 'var1' }],
      },
    };

    assertThrows(() => {
      command_helper.sortVariablesPublic(variables);
    });
  });

  it('correctly throws error when more complex variable dependencies are circular', () => {
    const command_helper = new TestCommandHelper({});

    const variables: ParsedVariablesType = {
      var1: {
        type: 'string',
        provider: '${{ variables.var3 }}',
        dependant_variables: [{ key: 'provider', value: 'var3' }],
      },
      var2: {
        type: 'string',
        provider: '${{ variables.var1 }}',
        dependant_variables: [{ key: 'provider', value: 'var1' }],
      },
      var3: {
        type: 'string',
        provider: '${{ variables.var2 }}',
        dependant_variables: [{ key: 'provider', value: 'var2' }],
      },
    };

    assertThrows(() => {
      command_helper.sortVariablesPublic(variables);
    });
  });
});
