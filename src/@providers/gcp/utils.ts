import { google } from 'https://esm.sh/v124/googleapis@118.0.0';
import { ResourceInputs } from '../../@resources/index.ts';
import { GoogleCloudCredentials } from './credentials.ts';

export class GcpClusterImportIds {
  clusterId = '';
  nodePoolIds: string[] = [];
}

export default class GcpUtils {
  public static getAuthClient(credentials: GoogleCloudCredentials): any {
    return new google.auth.GoogleAuth({
      keyFile: credentials.serviceAccountCredentialsFile,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }

  public static async getVpcInputs(
    credentials: GoogleCloudCredentials,
    id: string,
  ): Promise<ResourceInputs['vpc']> {
    const auth = this.getAuthClient(credentials);
    const networks = await google.compute('v1').networks.get({
      project: credentials.project,
      auth: auth,
      network: id,
    });
    const network = networks.data;

    return {
      name: network.name || '',
      description: network.description || '',
      region: '',
      type: 'vpc',
    };
  }

  public static async getClusterInputs(
    credentials: GoogleCloudCredentials,
    id: string,
  ): Promise<ResourceInputs['kubernetesCluster']> {
    const [project, zone, name] = id.split('/');
    const auth = this.getAuthClient(credentials);
    const clusterReq = await google
      .container('v1beta1')
      .projects.zones.clusters.get({
        auth,
        name: name,
        clusterId: name,
        zone,
        projectId: project,
      });
    const nodePools = (clusterReq.data.nodePools || []).map((nodePool) => {
      return {
        name: nodePool.name || '',
        count: nodePool.initialNodeCount || 0,
        nodeSize: nodePool.config?.machineType || '',
      };
    });
    const inputs: ResourceInputs['kubernetesCluster'] = {
      name: clusterReq.data.name || '',
      description: clusterReq.data.description || '',
      region: clusterReq.data.zone || '',
      vpc: clusterReq.data.network || '',
      nodePools: nodePools,
      type: 'kubernetesCluster',
      kubernetesVersion: clusterReq.data.currentMasterVersion || '',
    };
    return inputs;
  }

  public static async getClusterImportIds(
    credentials: GoogleCloudCredentials,
    project: string,
    name: string,
    zone: string,
  ): Promise<GcpClusterImportIds> {
    const auth = this.getAuthClient(credentials);
    const clusterReq = await google
      .container('v1beta1')
      .projects.zones.clusters.get({
        auth,
        name,
        zone,
        clusterId: name,
        projectId: project,
      });
    const results = new GcpClusterImportIds();
    results.clusterId = `projects/${credentials.project}/locations/${clusterReq.data.zone}/clusters/${name}`;
    for (const nodePool of clusterReq.data.nodePools || []) {
      results.nodePoolIds.push(
        `projects/${credentials.project}/locations/${clusterReq.data.zone}/clusters/${name}/nodePools/${nodePool.name}`,
      );
    }
    return results;
  }
}
