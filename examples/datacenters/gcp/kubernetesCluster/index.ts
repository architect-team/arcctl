import * as gcp from "@pulumi/gcp";
import * as kubernetes from '@pulumi/kubernetes';

const inputs = process.env.INPUTS;
if (!inputs) {
  throw new Error('Missing configuration. Please provide it via the INPUTS environment variable.');
}

type Config = {
  name: string;
  region: string;
  project: string;
  credentials: string;
  vpc: string;
  kubeconfig?: string;
  description?: string;
  nodePools: {
    name: string;
    count: number;
    nodeSize: string;
  }[];
};

const config: Config = JSON.parse(inputs);

const provider = new gcp.Provider('provider', {
  region: config.region,
  project: config.project,
  credentials: config.credentials,
});

const _computeProjectService = new gcp.projects.Service('cluster-compute-service', {
  service: 'compute.googleapis.com',
  disableOnDestroy: false,
}, { provider });

const _clusterProjectService = new gcp.projects.Service('cluster-container-service', {
  service: 'container.googleapis.com',
  disableOnDestroy: false,
}, { provider });

const cluster = new gcp.container.Cluster('cluster', {
  name: config.name,
  description: config.description,
  initialNodeCount: 1,
  location: config.region,
  masterAuth: {
    clientCertificateConfig: {
      issueClientCertificate: true
    }
  },
  networkingMode: 'VPC_NATIVE',
  ipAllocationPolicy: {
    stackType: 'IPV4'
  },
  minMasterVersion: 'latest',
  network: config.vpc,
  removeDefaultNodePool: true
}, {
  provider,
  dependsOn: [_computeProjectService, _clusterProjectService]
});

const nodePools = [];
for (const nodePool of config.nodePools) {
  nodePools.push(new gcp.container.NodePool(nodePool.name, {
    cluster: cluster.name,
    name: nodePool.name,
    location: config.region,
    initialNodeCount: nodePool.count,
    nodeConfig: {
      machineType: nodePool.nodeSize,
      oauthScopes: ['https://www.googleapis.com/auth/cloud-platform']
    }
  }, { provider }));
}

const clientConfig = await gcp.organizations.getClientConfig({ provider });
const intermediateKubeconfig = cluster.name.apply((clusterName: string) =>
  cluster.endpoint.apply((clusterEndpoint: string) =>
    cluster.masterAuth.clusterCaCertificate.apply((clusterCaCertificate: string) =>
      `
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: ${clusterCaCertificate}
    server: https://${clusterEndpoint}
  name: ${clusterName}
contexts:
- context:
    cluster:  ${clusterName}
    user:  ${clusterName}
  name:  ${clusterName}
current-context:  ${clusterName}
kind: Config
preferences: {}
users:
- name:  ${clusterName}
  user:
    token: ${clientConfig.accessToken}
`
    )
  )
);

const kubernetesProvider = new kubernetes.Provider('provider' + Date.now(), {
  kubeconfig: config.kubeconfig || intermediateKubeconfig,
});

const serviceAccount = new kubernetes.core.v1.ServiceAccount('service_account', {
  metadata: {
    name: cluster.name
  }
}, {
  provider: kubernetesProvider,
});

new kubernetes.rbac.v1.ClusterRoleBinding('cluster_role_binding', {
  roleRef: {
    apiGroup: 'rbac.authorization.k8s.io',
    kind: 'ClusterRole',
    name: 'cluster-admin'
  },
  subjects: [{
    name: serviceAccount.metadata.name,
    namespace: 'default',
    kind: 'ServiceAccount'
  }]
}, {
  provider: kubernetesProvider,
});

const serviceAccountSecret = new kubernetes.core.v1.Secret('service_account_secret', {
  metadata: {
    name: cluster.name,
    annotations: {
      'kubernetes.io/service-account.name': cluster.name
    }
  },
  type: 'kubernetes.io/service-account-token'
}, {
  provider: kubernetesProvider,
});

export const id = cluster.id;
export const name = cluster.name;
export const vpc = cluster.network;
export const kubernetesVersion = cluster.masterVersion;
export const description = cluster.description;
export const kubeconfig = cluster.name.apply((clusterName: string) =>
  cluster.endpoint.apply((clusterEndpoint: string) =>
    cluster.masterAuth.clusterCaCertificate.apply((clusterCaCertificate: string) =>
      serviceAccountSecret.data.apply(serviceAccountToken =>
      `
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: ${clusterCaCertificate}
    server: https://${clusterEndpoint}
  name: ${clusterName}
contexts:
- context:
    cluster:  ${clusterName}
    user:  ${clusterName}
  name:  ${clusterName}
current-context:  ${clusterName}
kind: Config
preferences: {}
users:
- name:  ${clusterName}
  user:
    token: ${Buffer.from(serviceAccountToken.token, 'base64')}
`
      )
    )
  )
);
