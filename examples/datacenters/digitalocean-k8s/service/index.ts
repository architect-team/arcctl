import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const namespace = config.get("namespace")!;
const deploymentName = config.get('name')!;
const hostPort = config.getNumber('hostPort')!;
const targetPort = config.getNumber('targetPort')!;

// Create a kubernetes service
const appLabels = { app: deploymentName };
const service = new k8s.core.v1.Service(deploymentName, {
    metadata: { name: deploymentName },
    spec: {
        selector: appLabels,
        ports: [{ name: "http", port: hostPort }]
    }
});

export const id = pulumi.interpolate`${namespace}/${service.metadata.name}`;
export const protocol = "http";
export const host = service.spec.loadBalancerIP;
export const port = service.spec.ports[0].port;
export const url = pulumi.interpolate`${protocol}://${host}:${port}`;
export const name = service.metadata.name;
