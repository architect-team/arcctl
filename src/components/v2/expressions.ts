import { CloudEdge, CloudGraph, CloudNode } from '../../cloud-graph/index.js';
import { GraphContext } from '../component.js';

const parseDatabaseRefs = <T extends CloudNode>(
  graph: CloudGraph,
  context: GraphContext,
  node: T,
): T => {
  node.inputs = JSON.parse(
    JSON.stringify(node.inputs).replace(
      /\${{\s?databases\.([\w-]+)\.([\dA-Za-z]+)\s?}}/g,
      (_, database_name, key) => {
        const database_schema_node_id = CloudNode.genId({
          type: 'databaseSchema',
          name: database_name,
          component: context.component.name,
          environment: context.environment,
        });

        const database_user_node = new CloudNode({
          name: `${node.type}-${node.name}/${database_name}`,
          component: context.component.name,
          environment: context.environment,
          inputs: {
            type: 'databaseUser',
            provider: `\${{ ${database_schema_node_id}.provider }}`,
            username: node.name,
            databaseSchema: `\${{ ${database_schema_node_id}.id }}`,
          },
        });

        graph.insertNodes(database_user_node);
        graph.insertEdges(
          new CloudEdge({
            from: database_user_node.id,
            to: database_schema_node_id,
            required: true,
          }),
          new CloudEdge({
            from: node.id,
            to: database_user_node.id,
            required: true,
          }),
        );

        return `\${{ ${database_user_node.id}.${key} }}`;
      },
    ),
  );

  return node;
};

const parseBuildRefs = <T extends CloudNode>(
  graph: CloudGraph,
  context: GraphContext,
  node: T,
): T => {
  node.inputs = JSON.parse(
    JSON.stringify(node.inputs).replace(
      /\${{\s?builds\.([\w-]+)\.([\dA-Za-z]+)\s?}}/g,
      (_, build_name, key) => {
        const build_node_id = CloudNode.genId({
          type: 'dockerBuild',
          name: build_name,
          component: context.component.name,
          environment: context.environment,
        });

        graph.insertEdges(
          new CloudEdge({
            from: node.id,
            to: build_node_id,
            required: true,
          }),
        );

        return `\${{ ${build_node_id}.${key} }}`;
      },
    ),
  );

  return node;
};

const parseServiceRefs = <T extends CloudNode>(
  graph: CloudGraph,
  context: GraphContext,
  node: T,
): T => {
  node.inputs = JSON.parse(
    JSON.stringify(node.inputs).replace(
      /\${{\s?services\.([\w-]+)\.([\dA-Za-z]+)\s?}}/g,
      (_, service_name, key) => {
        const service_node_id = CloudNode.genId({
          type: 'service',
          name: service_name,
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

const parseIngressRefs = <T extends CloudNode>(
  graph: CloudGraph,
  context: GraphContext,
  node: T,
): T => {
  node.inputs = JSON.parse(
    JSON.stringify(node.inputs).replace(
      /\${{\s?ingresses\.([\w-]+)\.([\dA-Za-z]+)\s?}}/g,
      (_, ingress_name, key) => {
        const ingress_node_id = CloudNode.genId({
          type: 'ingressRule',
          name: ingress_name,
          component: context.component.name,
          environment: context.environment,
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

const parseDependencyOutputRefs = <T extends CloudNode>(
  graph: CloudGraph,
  dependencies: Record<string, string>,
  context: GraphContext,
  node: T,
): T => {
  node.inputs = JSON.parse(
    JSON.stringify(node.inputs).replace(
      /\${{\s?dependencies\.([\w/-]+)\.outputs\.([\w-]+)\s?}}/g,
      (_, dependency_name, output_name) => {
        const dep_component = dependencies[dependency_name];
        if (!dep_component) {
          throw new Error(`Invalid dependency reference: ${dependency_name}`);
        }

        const dependency_node_id = CloudNode.genId({
          type: 'secret',
          name: output_name,
          component: dep_component,
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

const parseDependencyServiceRefs = <T extends CloudNode>(
  graph: CloudGraph,
  dependencies: Record<string, string>,
  context: GraphContext,
  node: T,
): T => {
  node.inputs = JSON.parse(
    JSON.stringify(node.inputs).replace(
      /\${{\s?dependencies\.([\w/-]+)\.services\.([\w-]+)\.([\dA-Za-z]+)\s?}}/g,
      (_, dependency_name, service_name, key) => {
        const dep_component = dependencies[dependency_name];
        if (!dep_component) {
          throw new Error(`Invalid dependency reference: ${dependency_name}`);
        }

        const dependency_node_id = CloudNode.genId({
          type: 'service',
          name: service_name,
          component: dep_component,
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
  dependencies: Record<string, string>,
  context: GraphContext,
  node: T,
): T => {
  node.inputs = JSON.parse(
    JSON.stringify(node.inputs).replace(
      /\${{\s?dependencies\.([\w/-]+)\.ingresses\.([\w-]+)\.([\dA-Za-z]+)\s?}}/g,
      (_, dependency_name, ingress_name, key) => {
        const dep_component = dependencies[dependency_name];
        if (!dep_component) {
          throw new Error(`Invalid dependency reference: ${dependency_name}`);
        }

        const dependency_node_id = CloudNode.genId({
          type: 'ingressRule',
          name: ingress_name,
          component: dep_component,
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

export const parseExpressionRefs = <T extends CloudNode>(
  graph: CloudGraph,
  dependencies: Record<string, string>,
  context: GraphContext,
  node: T,
): T => {
  node = parseDatabaseRefs(graph, context, node);
  node = parseBuildRefs(graph, context, node);
  node = parseServiceRefs(graph, context, node);
  node = parseIngressRefs(graph, context, node);
  node = parseDependencyOutputRefs(graph, dependencies, context, node);
  node = parseDependencyServiceRefs(graph, dependencies, context, node);
  node = parseDependencyIngressRefs(graph, dependencies, context, node);
  return node;
};
