import { local } from "@pulumi/command";
import * as kubernetes from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const name = config.require("name");
const clusterName = config.require("clusterName");
const accountId = config.require("accountId")

const awsConfig = new pulumi.Config("aws");
const saName = 'aws-load-balancer-controller';

// Create IAM Policy + SA for the LB Controller to use
// TODO: If it already exists and this runs again, this will fail, so I added || true as a hack.
const iam_policy = new local.Command("iam_policy", {
  create: "aws iam create-policy --policy-name AWSLoadBalancerControllerIAMPolicy --policy-document file://iam_policy.json || true",
  environment: {
    "AWS_ACCESS_KEY_ID": awsConfig.require("accessKey"),
    "AWS_SECRET_ACCESS_KEY": awsConfig.require("secretKey"),
    "AWS_DEFAULT_REGION": awsConfig.require("region")
  }
});

const iam_service_account = new local.Command("iam_service_acct", {
  create: `eksctl create iamserviceaccount --cluster=${clusterName} \
    --namespace=kube-system --name=${saName} \
    --role-name AmazonEKSLoadBalancerControllerRole \
    --attach-policy-arn=arn:aws:iam::${accountId}:policy/AWSLoadBalancerControllerIAMPolicy \
    --approve || true`,
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