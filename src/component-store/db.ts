/**
 * The repository DB contains a dictionary of locally accessible images. The DB is
 * organized by repo and then tag/digest references. Example contents include:
 *
 * {
 *   "postgres": {
 *     "postgres:11": "./sha256/e07f0c129d9a26cee91d34a544ec2d00e8b3f4eb45a70cdaef2e466e51eefe59",
 *     "postgres:9.6": "./sha256/558c135126d85e49463a5bb8885d549d5367ad3544ac825193158757d954c6a7",
 *     "postgres@sha256:82c335ccb6b60941cb860cbb8252c12f63fd3e27a0d15bce5bc6de110c02a2b4": "./sha256/558c135126d85e49463a5bb8885d549d5367ad3544ac825193158757d954c6a7",
 *     "postgres@sha256:d441bf645a1dcd2b4429d916c276d4c01299ee16b7a0e0f3d0baa846cbd4ee07": "./sha256/e07f0c129d9a26cee91d34a544ec2d00e8b3f4eb45a70cdaef2e466e51eefe59"
 *   },
 *   "architect/cloud": {
 *     "architect/cloud:latest": "/Users/architect/architect-cloud",
 *     "architect/cloud:1.0": "./sha256/82c335ccb6b60941cb860cbb8252c12f63fd3e27a0d15bce5bc6de110c02a2b4"
 *   }
 *   ...
 * }
 */
export type ComponentStoreDB = {
  [repo: string]: {
    [ref: string]: string;
  };
};
