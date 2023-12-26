import * as gcp from "@pulumi/gcp";

const inputs = process.env.INPUTS;
if (!inputs) {
  throw new Error('Missing configuration. Please provide it via the INPUTS environment variable.');
}

type Config = {
  name: string;
  cluster_id: string;
};

const config: Config = JSON.parse(inputs);

const database = new gcp.sql.Database(config.name, { 
  name: `db-${config.name}`.replace(/\//g, '-'),
  instance: config.cluster_id,
});

export const name = database.name;
