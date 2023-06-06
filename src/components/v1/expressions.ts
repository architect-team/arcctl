import { CloudEdge, CloudGraph, CloudNode } from '../../cloud-graph/index.ts';
import { GraphContext } from '../component.ts';

const parseSecretRefs = <T extends CloudNode>(
  graph: CloudGraph,
  context: GraphContext,
  node: T,
): T => {
  node.inputs = JSON.parse(
    JSON.stringify(node.inputs).replace(
      /\${{\s?(?:parameters|secrets|inputs)\.([\w-]+)\s?}}/g,
      (_, input_name) => {
        const input_node_id = CloudNode.genId({
          type: 'secret',
          name: input_name,
          component: context.component.name,
          environment: context.environment,
        });
        graph.insertEdges(
          new CloudEdge({
            from: node.id,
            to: input_node_id,
            required: true,
          }),
        );
        return `\${{ ${input_node_id}.value }}`;
      },
    ),
  );
  return node;
};

const parseDependencyOutputRefs = <T extends CloudNode>(
  graph: CloudGraph,
  context: GraphContext,
  node: T,
): T => {
  node.inputs = JSON.parse(
    JSON.stringify(node.inputs).replace(
      /\${{\s?dependencies\.([\w/-]+)\.outputs\.([\w-]+)\s?}}/g,
      (_, dependency_name, output_name) => {
        const dependency_node_id = CloudNode.genId({
          type: 'secret',
          name: output_name,
          component: dependency_name,
        });
        graph.insertEdges(
          new CloudEdge({
            from: node.id,
            to: dependency_node_id,
            required: true,
          }),
        );
        return `\${{ ${dependency_node_id}.value }}`;
      },
    ),
  );
  return node;
};

const parseDependencyInterfaceRefs = <T extends CloudNode>(
  graph: CloudGraph,
  context: GraphContext,
  node: T,
): T => {
  node.inputs = JSON.parse(
    JSON.stringify(node.inputs).replace(
      /\${{\s?dependencies\.([\w/-]+)\.interfaces\.([\w-]+)\.([\dA-Za-z]+)\s?}}/g,
      (_, dependency_name, interface_name, key) => {
        const dependency_node_id = CloudNode.genId({
          type: 'service',
          name: interface_name,
          component: dependency_name,
          environment: context.environment,
        });
        graph.insertEdges(
          new CloudEdge({
            from: node.id,
            to: dependency_node_id,
            required: true,
          }),
        );

        return `\${{ ${dependency_node_id}.${key} }}`;
      },
    ),
  );
  return node;
};

const parseDependencyIngressRefs = <T extends CloudNode>(
  graph: CloudGraph,
  context: GraphContext,
  node: T,
): T => {
  node.inputs = JSON.parse(
    JSON.stringify(node.inputs).replace(
      /\${{\s?dependencies\.([\w/-]+)\.ingresses\.([\w-]+)\.([\dA-Za-z]+)\s?}}/g,
      (_, dependency_name, interface_name, key) => {
        const dependency_node_id = CloudNode.genId({
          type: 'ingressRule',
          name: interface_name,
          component: dependency_name,
          environment: context.environment,
        });
        graph.insertEdges(
          new CloudEdge({
            from: node.id,
            to: dependency_node_id,
            required: true,
          }),
        );
        return `\${{ ${dependency_node_id}.${key} }}`;
      },
    ),
  );
  return node;
};

const parseServiceInterfaceRefs = <T extends CloudNode>(
  graph: CloudGraph,
  context: GraphContext,
  node: T,
): T => {
  node.inputs = JSON.parse(
    JSON.stringify(node.inputs).replace(
      /\${{\s?services\.([\w-]+)\.interfaces\.([\w-]+)\.([\dA-Za-z]+)\s?}}/g,
      (_, service_name, interface_name, key) => {
        const service_node_id = CloudNode.genId({
          type: 'service',
          name: `${service_name}-${interface_name}`,
          component: context.component.name,
          environment: context.environment,
        });
        graph.insertEdges(
          new CloudEdge({
            from: node.id,
            to: service_node_id,
            required: true,
          }),
        );

        return `\${{ ${service_node_id}.${key} }}`;
      },
    ),
  );
  return node;
};

const parseComponentInterfaceRefs = <T extends CloudNode>(
  graph: CloudGraph,
  context: GraphContext,
  node: T,
): T => {
  node.inputs = JSON.parse(
    JSON.stringify(node.inputs).replace(
      /\${{\s?interfaces\.([\w-]+)\.([\dA-Za-z]+)\s?}}/g,
      (_, interface_name, key) => {
        const interface_node_id = CloudNode.genId({
          type: 'service',
          name: interface_name,
          component: context.component.name,
          environment: context.environment,
        });
        graph.insertEdges(
          new CloudEdge({
            from: node.id,
            to: interface_node_id,
            required: true,
          }),
        );

        return `\${{ ${interface_node_id}.${key} }}`;
      },
    ),
  );
  return node;
};

const parseComponentIngressRefs = <T extends CloudNode>(
  graph: CloudGraph,
  context: GraphContext,
  node: T,
): T => {
  node.inputs = JSON.parse(
    JSON.stringify(node.inputs).replace(
      /\${{\s?ingresses\.([\w-]+)\.([\dA-Za-z]+)\s?}}/g,
      (_, interface_name, key) => {
        const ingress_node_id = CloudNode.genId({
          type: 'ingressRule',
          component: context.component.name,
          environment: context.environment,
          name: interface_name,
        });
        graph.insertEdges(
          new CloudEdge({
            from: node.id,
            to: ingress_node_id,
            required: true,
          }),
        );
        return `\${{ ${ingress_node_id}.${key} }}`;
      },
    ),
  );
  return node;
};

export const parseExpressionRefs = <T extends CloudNode>(
  graph: CloudGraph,
  context: GraphContext,
  node: T,
): T => {
  node = parseSecretRefs(graph, context, node);
  node = parseDependencyOutputRefs(graph, context, node);
  node = parseDependencyInterfaceRefs(graph, context, node);
  node = parseDependencyIngressRefs(graph, context, node);
  node = parseServiceInterfaceRefs(graph, context, node);
  node = parseComponentInterfaceRefs(graph, context, node);
  node = parseComponentIngressRefs(graph, context, node);
  return node;
};
