import * as gcp from "@pulumi/gcp";

const inputs = process.env.INPUTS;
if (!inputs) {
  throw new Error('Missing configuration. Please provide it via the INPUTS environment variable.');
}

type Config = {
  name: string;
  cluster_id: string;
  region: string;
  project: string;
  credentials: string;
};

const config: Config = JSON.parse(inputs);

const provider = new gcp.Provider('gcp-provider', {
  credentials: config.credentials,
  project: config.project,
  region: config.region,
});

const database = new gcp.sql.Database(config.name, { 
  name: `db-${config.name}`.replace(/\//g, '-'),
  instance: config.cluster_id,
}, { provider });

export const name = database.name;
