import { parseComponent } from '../parser.js';
import ComponentV1 from '../v1/index.js';
import ComponentV2 from '../v2/index.js';
import yaml from 'js-yaml';
import url from 'url';

const __dirname = new URL('.', import.meta.url).pathname;

describe('Component parser', () => {
  it('should parse default schema', async () => {
    const raw_obj = yaml.load(`
      name: test
      services:
        main:
          image: nginx:latest
    `) as Record<string, unknown>;
    const component_obj = await parseComponent(raw_obj);
    expect(component_obj).toBeInstanceOf(ComponentV1);
  });

  it('should parse specific schema', async () => {
    const raw_obj = yaml.load(`
      version: v2
      deployments:
        main:
          image: nginx:latest
    `) as Record<string, unknown>;
    const component_obj = await parseComponent(raw_obj);
    expect(component_obj).toBeInstanceOf(ComponentV2);
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
      expect(errs).toEqual(
        expect.arrayContaining([
          {
            instancePath: '/services/main',
            schemaPath:
              '#/oneOf/0/properties/services/additionalProperties/anyOf/0/additionalProperties',
            keyword: 'additionalProperties',
            params: { additionalProperty: 'bad-key' },
            message: 'must NOT have additional properties',
          },
        ]),
      );
      return;
    }

    throw new Error('Should have failed');
  });
});
