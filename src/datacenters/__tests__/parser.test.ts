import * as hclParser from 'hcl2-parser';
import { assertArrayIncludes, assertInstanceOf, fail } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';
import { parseDatacenter } from '../parser.ts';
import DatacenterV1 from '../v1/index.ts';

describe('Datacenter parser', () => {
  it('should parse default schema', async () => {
    const raw_obj = hclParser.default.parseToObject(`
      module "vpc" {
        source = "./vpc"
        inputs = {
          name = "test"
        }
      }
    `)[0];
    const datacenter_obj = await parseDatacenter(raw_obj);
    assertInstanceOf(datacenter_obj, DatacenterV1);
  });

  it('should parse specific schema', async () => {
    const raw_obj = hclParser.default.parseToObject(`
      version = "v1"

      module "vpc" {
        source = "./vpc"
        inputs = {
          name = "test"
        }
      }
    `)[0];
    const datacenter_obj = await parseDatacenter(raw_obj);
    assertInstanceOf(datacenter_obj, DatacenterV1);
  });

  it('should fail to parse schema with bad field', async () => {
    const raw_obj = hclParser.default.parseToObject(`
      module "vpc" {
        source = "./vpc"
        bad_key = "test"
        inputs = {
          name = "test"
        }
      }
    `)[0];
    try {
      await parseDatacenter(raw_obj);
      fail('Expected to fail with json schema error');
    } catch (errs) {
      assertArrayIncludes(errs, [
        {
          instancePath: '/module/vpc/0',
          keyword: 'additionalProperties',
          schemaPath:
            '#/definitions/DatacenterSchema/properties/module/additionalProperties/items/additionalProperties',
          params: { additionalProperty: 'bad_key' },
          message: 'must NOT have additional properties',
        },
      ]);
      return;
    }
  });
});
