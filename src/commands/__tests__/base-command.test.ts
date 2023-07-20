import { assertArrayIncludes, assertEquals, assertThrows } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';
import { ParsedVariablesType } from '../../datacenters/index.ts';
import { DatacenterUtils } from '../common/datacenter.ts';

function getDatacenterUtils(): DatacenterUtils {
  return new DatacenterUtils({} as any, {} as any, {} as any, {} as any);
}

describe('CommandHelper methods', () => {
  it('correctly sorts no order necessary', () => {
    const datacenterUtils = getDatacenterUtils();

    const variables: ParsedVariablesType = {
      var1: {
        type: 'region',
      },
      var2: {
        type: 'arcctlAccount',
        provider: 'digitalocean',
      },
    };

    const result = datacenterUtils.sortVariables(variables);
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
    const datacenterUtils = getDatacenterUtils();

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

    const result = datacenterUtils.sortVariables(variables);
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
    const datacenterUtils = getDatacenterUtils();

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

    const result = datacenterUtils.sortVariables(variables);
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
    const datacenterUtils = getDatacenterUtils();

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

    const result = datacenterUtils.sortVariables(variables);
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
    const datacenterUtils = getDatacenterUtils();

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
      datacenterUtils.sortVariables(variables);
    });
  });

  it('correctly throws error when more complex variable dependencies are circular', () => {
    const datacenterUtils = getDatacenterUtils();

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
      datacenterUtils.sortVariables(variables);
    });
  });
});
