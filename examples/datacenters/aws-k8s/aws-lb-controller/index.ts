import { local } from "@pulumi/command";
import * as kubernetes from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const name = config.require("name");
const clusterName = config.require("clusterName");
const accountId = config.require("accountId")

const awsConfig = new pulumi.Config("aws");
const saName = 'aws-load-balancer-controller';

// TODO: This getting deleted before the ingress causes issues.

// Create IAM Policy + SA for the LB Controller to use
// TODO: Should either give this a more unique name or not delete it
// because it could be reused by other envs.
const iam_policy = new local.Command("iam_policy", {
  create: "aws iam create-policy --policy-name AWSLoadBalancerControllerIAMPolicy --policy-document file://iam_policy.json || true",
  // delete: `aws iam delete-policy --policy-arn arn:aws:iam::${accountId}:policy/AWSLoadBalancerControllerIAMPolicy`,
  environment: {
    "AWS_ACCESS_KEY_ID": awsConfig.require("accessKey"),
    "AWS_SECRET_ACCESS_KEY": awsConfig.require("secretKey"),
    "AWS_DEFAULT_REGION": awsConfig.require("region")
  }
});

const iam_service_account = new local.Command("iam_service_acct", {
  create: `eksctl create iamserviceaccount --cluster=${clusterName} \
    --namespace=kube-system --name=${saName} \
    --attach-policy-arn=arn:aws:iam::${accountId}:policy/AWSLoadBalancerControllerIAMPolicy \
    --approve || true`,
  delete: `eksctl delete iamserviceaccount --cluster=${clusterName} --namespace=kube-system --name=${saName}`,
  environment: {
    "AWS_ACCESS_KEY_ID": awsConfig.require("accessKey"),
    "AWS_SECRET_ACCESS_KEY": awsConfig.require("secretKey"),
    "AWS_DEFAULT_REGION": awsConfig.require("region")
  }
}, { dependsOn: iam_policy})


const provider = new kubernetes.Provider("provider", {
  kubeconfig: config.require("kubeconfig"),
});

const controller = new kubernetes.helm.v3.Release("aws-lb-controller", {
  name,
  namespace: 'kube-system',
  chart: 'aws-load-balancer-controller',
  version: '1.6.1',
  repositoryOpts: {
    repo: "https://aws.github.io/eks-charts",
  },
  values: {
    clusterName,
    serviceAccount: {
      create: false,
      name: saName
    }
  },
}, { provider, dependsOn: iam_service_account });

export const id = controller.id.apply(id => id.toString());