import { google } from 'googleapis';
import { ResourceInputs, ResourceType } from '../../@resources/index.ts';
import { ResourceModule } from '../module.ts';
import { GoogleProvider as TerraformGoogleProvider } from './.gen/providers/google/provider/index.ts';
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

  /**
   * Returns a list of all GCP regions available. e.g. `us-east4`, `us-west1` -
   * NOT zones, e.g. `us-west1-a`.
   */
  public static async getProjectRegions(credentials: GoogleCloudCredentials, project: string): Promise<string[]> {
    const auth = this.getAuthClient(credentials);
    const { data } = await google.compute('v1').regions.list({
      project: project,
      auth: auth,
    });

    return (data.items || []).map((i) => i.name!);
  }

  public static configureProvider<T extends ResourceType>(resource_module: ResourceModule<T, GoogleCloudCredentials>) {
    new TerraformGoogleProvider(resource_module, 'gcp', {
      project: resource_module.credentials.project,
      credentials: resource_module.credentials.serviceAccountCredentialsFile,
    });
  }
}
