import { local } from "@pulumi/command";
import * as kubernetes from "@pulumi/kubernetes";

const inputs = process.env.INPUTS;
if (!inputs) {
  throw new Error('Missing configuration. Please provide it via the INPUTS environment variable.');
}

type Config = {
  name: string;
  namespace?: string;
  clusterName: string;
  accountId: string;
  aws: {
    accessKey: string;
    secretKey: string;
    region: string;
  };
}

const config: Config = JSON.parse(inputs);

const saName = 'aws-load-balancer-controller';

// Create this policy for the AWS Load Balancer if it doesn't already exist
const iam_policy = new local.Command("iam_policy", {
  create: "aws iam create-policy --policy-name AWSLoadBalancerControllerIAMPolicy --policy-document file://iam_policy.json || true",
  environment: {
    "AWS_ACCESS_KEY_ID": config.aws.accessKey,
    "AWS_SECRET_ACCESS_KEY": config.aws.secretKey,
    "AWS_DEFAULT_REGION": config.aws.region,
  }
});

const iam_service_account = new local.Command("iam_service_acct", {
  create: `eksctl create iamserviceaccount --cluster=${config.clusterName} \
    --namespace=kube-system --name=${saName} \
    --attach-policy-arn=arn:aws:iam::${config.accountId}:policy/AWSLoadBalancerControllerIAMPolicy \
    --approve || true`,
  delete: `eksctl delete iamserviceaccount --cluster=${config.clusterName} --namespace=kube-system --name=${saName}`,
  environment: {
    "AWS_ACCESS_KEY_ID": config.aws.accessKey,
    "AWS_SECRET_ACCESS_KEY": config.aws.secretKey,
    "AWS_DEFAULT_REGION": config.aws.region,
  }
}, { dependsOn: iam_policy })

new local.Command('cluster_config', {
  create: `eksctl utils write-kubeconfig --cluster=${config.clusterName} --region=${config.aws.region} && cat /root/.kube/config`,
  environment: {
    "AWS_ACCESS_KEY_ID": config.aws.accessKey,
    "AWS_SECRET_ACCESS_KEY": config.aws.secretKey,
    "AWS_DEFAULT_REGION": config.aws.region,
  },
})

const provider = new kubernetes.Provider("provider", {
  kubeconfig: '/root/.kube/config',
});

const controller = new kubernetes.helm.v3.Release("aws-lb-controller", {
  name: config.name,
  namespace: config.namespace,
  chart: 'aws-load-balancer-controller',
  version: '1.6.2',
  repositoryOpts: {
    repo: "https://aws.github.io/eks-charts",
  },
  values: {
    clusterName: config.clusterName,
    serviceAccount: {
      create: false,
      name: saName
    }
  },
}, { provider, dependsOn: iam_service_account });

export const id = controller.id.apply((id: string) => id.toString());