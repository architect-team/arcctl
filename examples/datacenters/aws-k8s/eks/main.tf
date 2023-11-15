variable "access_key" {
  type = string
}

variable "secret_key" {
  type = string
}

variable "region" {
  type = string
}

variable "name" {
  type = string
}

variable "vpc_id" {
  type = string
}

provider "aws" {
  region     = var.region
  access_key = var.access_key
  secret_key = var.secret_key
}

data "aws_subnets" "private_subnets" {
  filter {
    name   = "vpc-id"
    values = [var.vpc_id]
  }
  filter {
    name   = "tag:Name"
    values = ["*private*"]
  }
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "19.15.3"

  cluster_name    = var.name
  cluster_version = "1.28"

  vpc_id                         = var.vpc_id
  subnet_ids                     = data.aws_subnets.private_subnets.ids
  cluster_endpoint_public_access = true

  eks_managed_node_group_defaults = {
    ami_type                              = "AL2_x86_64"
    attach_cluster_primary_security_group = true
    create_security_group                 = false
  }

  node_security_group_tags = {
    "kubernetes.io/cluster/${var.name}" = null
  }

  eks_managed_node_groups = {
    one = {
      name = "pool-1"

      instance_types = ["t3.small"]

      min_size     = 1
      max_size     = 3
      desired_size = 1
    }

    two = {
      name = "pool-2"

      instance_types = ["t3.small"]

      min_size     = 1
      max_size     = 2
      desired_size = 1
    }
  }
}

data "aws_eks_cluster" "eks_cluster" {
  depends_on = [module.eks]
  name       = module.eks.cluster_name
}

output "id" {
  value = "${var.region}/${data.aws_eks_cluster.eks_cluster.id}"
}

output "kubernetesVersion" {
  value = module.eks.cluster_version
}

locals {
  kubeconfig = templatefile("kubeconfig.tpl", {
    kubeconfig_name                   = var.name
    endpoint                          = data.aws_eks_cluster.eks_cluster.endpoint
    cluster_auth_base64               = data.aws_eks_cluster.eks_cluster.certificate_authority[0].data
    aws_authenticator_command         = "aws"
    aws_authenticator_command_args    = ["eks", "get-token", "--cluster-name", var.name]
    aws_authenticator_additional_args = []
    aws_authenticator_env_variables = {
      AWS_ACCESS_KEY_ID     = var.access_key
      AWS_SECRET_ACCESS_KEY = var.secret_key
      AWS_DEFAULT_REGION    = var.region
    }
  })
}

output "kubeconfig" {
  value = local.kubeconfig
}
