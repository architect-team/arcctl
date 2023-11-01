import * as gcp from "@pulumi/gcp";
import * as kubernetes from '@pulumi/kubernetes';
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config('kubernetes');
const gcpConfig = new pulumi.Config('gcp');

const _computeProjectService = new gcp.projects.Service('cluster-compute-service', {
  service: 'compute.googleapis.com',
  disableOnDestroy: false,
});

const _clusterProjectService = new gcp.projects.Service('cluster-container-service', {
  service: 'container.googleapis.com',
  disableOnDestroy: false,
});

const clusterName = config.require('name');
const cluster = new gcp.container.Cluster(clusterName, {
  name: clusterName,
  description: config.get('description'),
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
  network: config.require('vpc'),
  removeDefaultNodePool: true
}, {
  dependsOn: [_computeProjectService, _clusterProjectService]
});

const nodePools = [];
for (const nodePool of JSON.parse(config.require('nodePools'))) {
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

const kubernetesProvider = new kubernetes.Provider('provider', {
  kubeconfig: intermediateKubeconfig,
});

const serviceAccount = new kubernetes.core.v1.ServiceAccount(clusterName, {
  metadata: {
    name: clusterName
  }
}, {
  provider: kubernetesProvider
});

const clusterRoleBinding = new kubernetes.rbac.v1.ClusterRoleBinding(clusterName, {
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
  provider: kubernetesProvider
});

const serviceAccountSecret = new kubernetes.core.v1.Secret(clusterName, {
  metadata: {
    name: clusterName,
    annotations: {
      'kubernetes.io/service-account.name': clusterName
    }
  },
  type: 'kubernetes.io/service-account-token'
}, {
  provider: kubernetesProvider
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

// TODO: remove
// kubectl create -n default serviceaccount test-service-account --kubeconfig test-kubeconfig.yml
// kubectl create -n default clusterrolebinding test-service-account-binding --clusterrole=cluster-admin --serviceaccount=default:test-service-account --kubeconfig test-kubeconfig.yml
/*
kubectl apply --kubeconfig test-kubeconfig.yml -f - <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: test-service-account-secret
  annotations:
    kubernetes.io/service-account.name: test-service-account
type: kubernetes.io/service-account-token
EOF
*/
// kubectl get secret/test-service-account-secret --template={{.data.token}} -n default --kubeconfig test-kubeconfig.yml | base64 -d
// USE THE USER TOKEN ABOVE IN THE KUBE CONFIG
