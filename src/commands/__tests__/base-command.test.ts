import { assertEquals, assertThrows } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';
import { ParsedVariablesType } from '../../datacenters/index.ts';
import { DatacenterUtils } from '../common/datacenter.ts';

function getDatacenterUtils(): DatacenterUtils {
  return new DatacenterUtils({} as any, {} as any);
}

describe('CommandHelper methods', () => {
  it('correctly sorts a single dependnecy', () => {
    const datacenterUtils = getDatacenterUtils();

    const variables: ParsedVariablesType = {
      var1: {
        type: 'string',
        value: '${{ variables.var2 }}',
        dependant_variables: [{ key: 'value', value: 'var2' }],
      },
      var2: {
        type: 'string',
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
        type: 'string',
        value: '${{ variables.var2 }}',
        dependant_variables: [{ key: 'value', value: 'var2' }],
      },
      var2: {
        type: 'string',
        value: '${{ variables.var3 }}',
        dependant_variables: [{ key: 'value', value: 'var3' }],
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

  it('correctly throws error when variable dependencies are circular', () => {
    const datacenterUtils = getDatacenterUtils();

    const variables: ParsedVariablesType = {
      var1: {
        type: 'string',
        value: '${{ variables.var2 }}',
        dependant_variables: [{ key: 'value', value: 'var2' }],
      },
      var2: {
        type: 'string',
        value: '${{ variables.var1 }}',
        dependant_variables: [{ key: 'value', value: 'var1' }],
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
        value: '${{ variables.var3 }}',
        dependant_variables: [{ key: 'value', value: 'var3' }],
      },
      var2: {
        type: 'string',
        value: '${{ variables.var1 }}',
        dependant_variables: [{ key: 'value', value: 'var1' }],
      },
      var3: {
        type: 'string',
        value: '${{ variables.var2 }}',
        dependant_variables: [{ key: 'value', value: 'var2' }],
      },
    };

    assertThrows(() => {
      datacenterUtils.sortVariables(variables);
    });
  });
});
