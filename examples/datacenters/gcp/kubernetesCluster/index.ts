import * as gcp from "@pulumi/gcp";
import * as kubernetes from '@pulumi/kubernetes';
import * as pulumi from "@pulumi/pulumi";

const inputs = process.env.INPUTS;
if (!inputs) {
  throw new Error('Missing configuration. Please provide it via the INPUTS environment variable.');
}

type Config = {
  name: string;
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

const gcpConfig = new pulumi.Config('gcp');

const _computeProjectService = new gcp.projects.Service('cluster-compute-service', {
  service: 'compute.googleapis.com',
  disableOnDestroy: false,
});

const _clusterProjectService = new gcp.projects.Service('cluster-container-service', {
  service: 'container.googleapis.com',
  disableOnDestroy: false,
});

const cluster = new gcp.container.Cluster('cluster', {
  name: config.name,
  description: config.description,
  initialNodeCount: 1,
  location: gcpConfig.require('region'),
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
  dependsOn: [_computeProjectService, _clusterProjectService]
});

const nodePools = [];
for (const nodePool of config.nodePools) {
  nodePools.push(new gcp.container.NodePool(nodePool.name, {
    cluster: cluster.name,
    name: nodePool.name,
    location: gcpConfig.require('region'),
    initialNodeCount: nodePool.count,
    nodeConfig: {
      machineType: nodePool.nodeSize,
      oauthScopes: ['https://www.googleapis.com/auth/cloud-platform']
    }
  }));
}

const clientConfig = await gcp.organizations.getClientConfig({});
const intermediateKubeconfig = cluster.name.apply(clusterName =>
  cluster.endpoint.apply(clusterEndpoint =>
    cluster.masterAuth.clusterCaCertificate.apply(clusterCaCertificate =>
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

const clusterRoleBinding = new kubernetes.rbac.v1.ClusterRoleBinding('cluster_role_binding', {
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
export const kubeconfig = cluster.name.apply(clusterName =>
  cluster.endpoint.apply(clusterEndpoint =>
    cluster.masterAuth.clusterCaCertificate.apply(clusterCaCertificate =>
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
