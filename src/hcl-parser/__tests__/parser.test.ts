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
            // NOTE: the merge() inputs from the HCL -> JSON converter are
            // unmodified HCL and not a proper json object.
            name: '${merge({ key1 = \'one\' }, { key2 = \'two\' })}',
            merged: '${merge(node.inputs, { key = \'overridden value\' })}',
          },
        },
      },
    };

    applyContext(obj, {
      node: {
        inputs: { key: 'value' },
      },
    });

    assertEquals(obj.module.vpc.inputs.name as any, {
      key1: 'one',
      key2: 'two',
    });
    assertEquals(obj.module.vpc.inputs.merged as any, {
      key: 'overridden value',
    });
  });

  it('should be able to merge arrays', () => {
    const obj = {
      module: {
        vpc: {
          inputs: `\${merge(node.inputs, [{
            test2 = "key"
          }])}`,
        },
      },
    };

    applyContext(obj, {
      node: {
        inputs: [
          {
            test: 'key',
          },
        ],
      },
    });

    assertEquals(
      obj.module.vpc.inputs as any,
      [
        {
          test: 'key',
        },
        {
          test2: 'key',
        },
      ],
    );
  });

  it('should handle nested merge functions', () => {
    const obj = {
      module: {
        vpc: {
          inputs: `\${merge(node.inputs, {
            test = merge(node.inputs.test, [{
              test2 = "key"
            }])
          })}`,
        },
      },
    };

    applyContext(obj, {
      node: {
        inputs: {
          name: 'this',
          test: [{
            test: 'value',
          }],
        },
      },
    });

    assertEquals(
      obj.module.vpc.inputs as any,
      {
        name: 'this',
        test: [{
          test: 'value',
        }, {
          test2: 'key',
        }],
      },
    );
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

  it('should support replace() function', () => {
    const obj = {
      module: {
        vpc: {
          source: 'architect/vpc:latest',
          inputs: {
            first: '${replace("test/this", "/", "--")}',
            second: '${replace(node.name, "test", "this")}',
            third: 'Host(${replace(node.name, "test", "this")})',
          },
        },
      },
    };

    applyContext(obj, {
      node: {
        name: 'test',
      },
    });

    assertEquals(obj.module.vpc.inputs.first, 'test--this');
    assertEquals(obj.module.vpc.inputs.second, 'this');
    assertEquals(obj.module.vpc.inputs.third, 'Host(this)');
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

  it('should support binary operations inside functions', () => {
    const obj = {
      module: {
        vpc: {
          source: 'architect/vpc:latest',
          inputs: {
            name: '${replace(node.name + "_" + node.type, "_", "-")}',
          },
        },
      },
    };

    applyContext(obj, {
      node: {
        name: 'test',
        type: 'vpc',
      },
    });

    assertEquals(obj.module.vpc.inputs.name, 'test-vpc');
  });

  it('should support replacements inside functions', () => {
    const obj = {
      module: [{
        vpc: {
          source: 'architect/vpc:latest',
          inputs: `\${merge(node.inputs, {
            dns_zone = variable.dns_zone
          })}`,
        },
      }],
    };

    applyContext(obj, {
      variable: {
        dns_zone: 'architect.io',
      },
    });

    assertEquals(
      obj.module[0].vpc.inputs,
      `\${merge(node.inputs,{dns_zone:'architect.io'})}`,
    );
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

  it('should support inline conditionals', () => {
    const obj = {
      module: [{
        vpc: {
          path: `127.0.0.1.nip.io\${node.inputs.path == "/" ? "" : node.inputs.path}`,
          unchanged: `127.0.0.1.nip.io\${node.inputs.invisible == "/" ? "" : node.inputs.invisible}`,
        },
      }],
    };

    applyContext(obj, {
      node: {
        inputs: {
          path: '/',
        },
      },
    });

    assertEquals(
      obj.module[0].vpc.path,
      '127.0.0.1.nip.io',
    );
    assertEquals(
      obj.module[0].vpc.unchanged,
      `127.0.0.1.nip.io\${node.inputs.invisible=='/'?'':node.inputs.invisible}`,
    );
  });

  it('should support parsing conditionals after regeneration of expression', () => {
    const obj = {
      module: [{
        vpc: {
          path: `127.0.0.1.nip.io\${node.inputs.path == "/" ? "" : node.inputs.path}`,
        },
      }],
    };

    applyContext(obj, {});
    applyContext(obj, {
      node: {
        inputs: {
          path: '/',
        },
      },
    });

    assertEquals(
      obj.module[0].vpc.path,
      '127.0.0.1.nip.io',
    );
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

  it('should correctly handle arrays inside object replacements', () => {
    const obj: any = {
      module: {
        inputs: {
          environment: `\${node.inputs.environment}`,
        },
      },
    };

    applyContext(obj, {
      node: {
        inputs: {
          environment: {
            command: ['sh', '-c', 'ls -l && cat stuff.txt'],
          },
        },
      },
    });

    assertEquals(obj.module.inputs.environment.command, ['sh', '-c', 'ls -l && cat stuff.txt']);
  });
});
