import yaml from 'js-yaml';
import { assertArrayIncludes, assertInstanceOf } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';
import { parseComponent } from '../parser.ts';
import ComponentV1 from '../v1/index.ts';
import ComponentV2 from '../v2/index.ts';

describe('Component parser', () => {
  it('should parse default schema', async () => {
    const raw_obj = yaml.load(`
      name: test
      services:
        main:
          image: nginx:latest
    `) as Record<string, unknown>;
    const component_obj = await parseComponent(raw_obj);
    assertInstanceOf(component_obj, ComponentV1);
  });

  it('should parse specific schema', async () => {
    const raw_obj = yaml.load(`
      version: v2
      deployments:
        main:
          image: nginx:latest
    `) as Record<string, unknown>;
    const component_obj = await parseComponent(raw_obj);
    assertInstanceOf(component_obj, ComponentV2);
  });

  it('should fail to parse schema with bad field', async () => {
    const raw_obj = yaml.load(`
      version: v1
      name: test
      services:
        main:
          image: nginx:latest
          bad-key: test
    `) as Record<string, unknown>;
    try {
      await parseComponent(raw_obj);
    } catch (errs) {
      assertArrayIncludes(JSON.parse(errs.message), [
        {
          instancePath: '/services/main',
          keyword: 'additionalProperties',
          schemaPath: '#/oneOf/0/properties/services/additionalProperties/anyOf/0/additionalProperties',
          params: { additionalProperty: 'bad-key' },
          message: 'must NOT have additional properties',
        },
      ]);
      return;
    }

    throw new Error('Should have failed');
  });
});
