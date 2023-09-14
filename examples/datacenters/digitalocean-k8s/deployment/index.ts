import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const namespace = config.get("namespace")!;
const deploymentName = config.get("name")!;
const image = config.get("image")!;
const environment: Record<string, string> = config.get("environment") ? JSON.parse(config.get("environment")!) : {};
const replicas = config.getNumber("replicas") || 1;

const appLabels = { app: deploymentName };
const deployment = new k8s.apps.v1.Deployment(deploymentName, {
    spec: {
        selector: { matchLabels: appLabels },
        replicas,
        template: {
          metadata: { labels: appLabels },
          spec: {
            containers: [{
              name: deploymentName,
              image,
              env: Object.entries(environment).map(([name, value]) => ({ name, value }))
            }],
          }
        }
    }
});
//export const name = deployment.metadata.name;
