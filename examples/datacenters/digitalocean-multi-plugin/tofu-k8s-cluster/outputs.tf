output "id" {
  value = digitalocean_kubernetes_cluster.cluster.id
}

output "kubernetesVersion" {
  value = digitalocean_kubernetes_cluster.cluster.version
}

output "kubeconfig" {
  value     = digitalocean_kubernetes_cluster.cluster.kube_config[0].raw_config
  sensitive = true
}
