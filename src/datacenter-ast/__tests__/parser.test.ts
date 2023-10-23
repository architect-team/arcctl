import { assertEquals } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';
import { applyContext } from '../parser.ts';

describe('AST: applyContext()', () => {
  it('should do nothing when matches to context aren\'t found', () => {
    const obj = {
      module: {
        vpc: {
          source: 'architect/vpc:latest',
          inputs: {
            name: 'test',
          },
        },
      },
    };

    const originalObj = { ...obj };

    applyContext(obj, {
      datacenter: {
        name: 'test',
      },
    });

    assertEquals(obj, originalObj);
  });

  it('should inject literal context value', () => {
    const obj = {
      module: {
        vpc: {
          source: 'architect/vpc:latest',
          inputs: {
            name: '${datacenter.name}',
          },
        },
      },
    };

    applyContext(obj, {
      datacenter: {
        name: 'test',
      },
    });

    assertEquals(obj.module.vpc.inputs.name, 'test');
  });

  it('should support toUpper() function', () => {
    const obj = {
      module: {
        vpc: {
          source: 'architect/vpc:latest',
          inputs: {
            name: '${toUpper(datacenter.name)}',
          },
        },
      },
    };

    applyContext(obj, {
      datacenter: {
        name: 'test',
      },
    });

    assertEquals(obj.module.vpc.inputs.name, 'TEST');
  });

  it('should support toLower() function', () => {
    const obj = {
      module: {
        vpc: {
          source: 'architect/vpc:latest',
          inputs: {
            name: '${toLower(datacenter.name)}',
          },
        },
      },
    };

    applyContext(obj, {
      datacenter: {
        name: 'TEST',
      },
    });

    assertEquals(obj.module.vpc.inputs.name, 'test');
  });

  it('should support trim() function', () => {
    const obj = {
      module: {
        vpc: {
          source: 'architect/vpc:latest',
          inputs: {
            name: '${trim(datacenter.name)}',
          },
        },
      },
    };

    applyContext(obj, {
      datacenter: {
        name: ' test ',
      },
    });

    assertEquals(obj.module.vpc.inputs.name, 'test');
  });

  it('should support startsWith() function', () => {
    const obj = {
      module: {
        vpc: {
          source: 'architect/vpc:latest',
          inputs: {
            name: '${startsWith("whatever", "two")}',
            other: '${startsWith("whatever", "what")}',
          },
        },
      },
    };

    applyContext(obj, {
      datacenter: {
        name: 'test-this',
      },
    });

    assertEquals(obj.module.vpc.inputs.name, 'false');
    assertEquals(obj.module.vpc.inputs.other, 'true');
  });

  it('should support merge() function', () => {
    const obj = {
      module: {
        vpc: {
          source: 'architect/vpc:latest',
          inputs: {
            name: '${merge({ key1: \'one\' }, { key2: \'two\' })}',
            merged: '${merge({ key: \'value\' }, { key: \'value2\' })}',
          },
        },
      },
    };

    applyContext(obj, {
      datacenter: {
        name: 'test',
      },
    });

    assertEquals(obj.module.vpc.inputs.name as any, {
      key1: 'one',
      key2: 'two',
    });
    assertEquals(obj.module.vpc.inputs.merged as any, {
      key: 'value2',
    });
  });

  it('should support contains() function', () => {
    const obj = {
      module: {
        vpc: {
          source: 'architect/vpc:latest',
          inputs: {
            first: '${contains(["mysql", "postgres"], "postgres")}',
            second: '${contains(["mysql", "postgres"], "redis")}',
          },
        },
      },
    };

    applyContext(obj, {});

    assertEquals(obj.module.vpc.inputs.first, 'true');
    assertEquals(obj.module.vpc.inputs.second, 'false');
  });

  it('should support functions of functions', () => {
    const obj = {
      module: {
        vpc: {
          source: 'architect/vpc:latest',
          inputs: {
            name: '${toUpper(trim(datacenter.name))}',
          },
        },
      },
    };

    applyContext(obj, {
      datacenter: {
        name: ' test ',
      },
    });

    assertEquals(obj.module.vpc.inputs.name, 'TEST');
  });

  it('should support == operator', () => {
    const obj = {
      module: {
        vpc: {
          source: 'architect/vpc:latest',
          inputs: {
            test: '${datacenter.name == "test"}',
            test2: '${datacenter.name == "test2"}',
          },
        },
      },
    };

    applyContext(obj, {
      datacenter: {
        name: 'test',
      },
    });

    assertEquals(obj.module.vpc.inputs.test, 'true');
    assertEquals(obj.module.vpc.inputs.test2, 'false');
  });

  it('should support != operator', () => {
    const obj = {
      module: {
        vpc: {
          source: 'architect/vpc:latest',
          inputs: {
            test: '${datacenter.name != "test"}',
            test2: '${datacenter.name != "test2"}',
          },
        },
      },
    };

    applyContext(obj, {
      datacenter: {
        name: 'test',
      },
    });

    assertEquals(obj.module.vpc.inputs.test, 'false');
    assertEquals(obj.module.vpc.inputs.test2, 'true');
  });

  it('should support > operator', () => {
    const obj = {
      module: {
        vpc: {
          source: 'architect/vpc:latest',
          inputs: {
            test: '${datacenter.name > 5}',
            test2: '${datacenter.name > 4}',
          },
        },
      },
    };

    applyContext(obj, {
      datacenter: {
        name: 5,
      },
    });

    assertEquals(obj.module.vpc.inputs.test, 'false');
    assertEquals(obj.module.vpc.inputs.test2, 'true');
  });

  it('should support < operator', () => {
    const obj = {
      module: {
        vpc: {
          source: 'architect/vpc:latest',
          inputs: {
            test: '${datacenter.name < 5}',
            test2: '${datacenter.name < 6}',
          },
        },
      },
    };

    applyContext(obj, {
      datacenter: {
        name: 5,
      },
    });

    assertEquals(obj.module.vpc.inputs.test, 'false');
    assertEquals(obj.module.vpc.inputs.test2, 'true');
  });

  it('should support >= operator', () => {
    const obj = {
      module: {
        vpc: {
          source: 'architect/vpc:latest',
          inputs: {
            test: '${datacenter.name >= 5}',
            test2: '${datacenter.name >= 6}',
          },
        },
      },
    };

    applyContext(obj, {
      datacenter: {
        name: 5,
      },
    });

    assertEquals(obj.module.vpc.inputs.test, 'true');
    assertEquals(obj.module.vpc.inputs.test2, 'false');
  });

  it('should support <= operator', () => {
    const obj = {
      module: {
        vpc: {
          source: 'architect/vpc:latest',
          inputs: {
            test: '${datacenter.name <= 5}',
            test2: '${datacenter.name <= 4}',
          },
        },
      },
    };

    applyContext(obj, {
      datacenter: {
        name: 5,
      },
    });

    assertEquals(obj.module.vpc.inputs.test, 'true');
    assertEquals(obj.module.vpc.inputs.test2, 'false');
  });

  it('should support && operator', () => {
    const obj = {
      module: {
        vpc: {
          source: 'architect/vpc:latest',
          inputs: {
            test: '${datacenter.name && true}',
            test2: '${datacenter.name && false}',
          },
        },
      },
    };

    applyContext(obj, {
      datacenter: {
        name: 'test',
      },
    });

    assertEquals(obj.module.vpc.inputs.test, 'true');
    assertEquals(obj.module.vpc.inputs.test2, 'false');
  });

  it('should support || operator', () => {
    const obj = {
      module: {
        vpc: {
          source: 'architect/vpc:latest',
          inputs: {
            test: '${datacenter.name || true}',
            test2: '${datacenter.name || false}',
          },
        },
      },
    };

    applyContext(obj, {
      datacenter: {
        name: '',
      },
    });

    assertEquals(obj.module.vpc.inputs.test, 'true');
    assertEquals(obj.module.vpc.inputs.test2, 'false');
  });

  it('should support the splat operator', () => {
    const obj: any = {
      module: {
        when: '${environment.nodes.*.type}',
      },
    };

    applyContext(obj, {
      environment: {
        nodes: [
          {
            type: 'database',
          },
          {
            type: 'cache',
          },
        ],
      },
    });

    assertEquals(obj.module.when, ['database', 'cache']);
  });

  it('should use empty array when splat has no nodes', () => {
    const obj: any = {
      module: {
        when: '${environment.nodes.*.type}',
      },
    };

    applyContext(obj, {
      environment: {
        nodes: [],
      },
    });

    assertEquals(obj.module.when, []);
  });
});
