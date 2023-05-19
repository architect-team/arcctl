import schema from './datacenter.schema.json' assert { type: 'json' };

console.log(schema.definitions.FullResource.oneOf.map(item => item.properties));