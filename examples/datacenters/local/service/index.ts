import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

// Create a kubernetes service
const appLabels = { app: "nginx" };
const service = new k8s.core.v1.Service("nginx", {
    metadata: { name: "nginx" },
    spec: {
        selector: appLabels,
        ports: [{ name: "http", port: 80, targetPort: 80 }]
    }
});

export const id = pulumi.interpolate`default/${service.metadata.name}`;
export const protocol = "http";
export const host = service.spec.loadBalancerIP;
export const port = service.spec.ports[0].port;
export const url = pulumi.interpolate`${protocol}://${host}:${port}`;
export const name = service.metadata.name;
