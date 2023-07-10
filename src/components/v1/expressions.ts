import { CloudEdge, CloudGraph, CloudNode } from '../../cloud-graph/index.ts';
import { GraphContext } from '../component.ts';

const parseSecretRefs = <T extends Record<string, any>>(
  graph: CloudGraph,
  context: GraphContext,
  from_id: string,
  inputs: T,
): T => {
  return JSON.parse(
    JSON.stringify(inputs).replace(
      /\${{\s?(?:parameters|secrets|variables|vars)\.([\w-]+)\s?}}/g,
      (_, input_name) => {
        const input_node_id = CloudNode.genId({
          type: 'secret',
          name: input_name,
          component: context.component.name,
          environment: context.environment,
        });
        graph.insertEdges(
          new CloudEdge({
            from: from_id,
            to: input_node_id,
            required: true,
          }),
        );
        return `\${{ ${input_node_id}.data }}`;
      },
    ),
  );
};

const parseDatabaseRefs = <T extends Record<string, any>>(
  graph: CloudGraph,
  context: GraphContext,
  from_id: string,
  inputs: T,
): T => {
  return JSON.parse(
    JSON.stringify(inputs).replace(
      /\${{\s?databases\.([\w-]+)\.([\dA-Za-z]+)\s?}}/g,
      (_, database_name, key) => {
        const database_schema_node_id = CloudNode.genId({
          type: 'databaseSchema',
          name: database_name,
          component: context.component.name,
          environment: context.environment,
        });

        const name = `${from_id}/${database_name}`;
        const database_user_node = new CloudNode({
          name,
          component: context.component.name,
          environment: context.environment,
          inputs: {
            type: 'databaseUser',
            account: `\${{ ${database_schema_node_id}.account }}`,
            username: name.replaceAll('/', '--'),
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
            from: from_id,
            to: database_user_node.id,
            required: true,
          }),
        );

        return `\${{ ${database_user_node.id}.${key} }}`;
      },
    ),
  );
};

const parseDependencyOutputRefs = <T extends Record<string, any>>(
  graph: CloudGraph,
  context: GraphContext,
  from_id: string,
  inputs: T,
): T => {
  return JSON.parse(
    JSON.stringify(inputs).replace(
      /\${{\s?dependencies\.([\w/-]+)\.outputs\.([\w-]+)\s?}}/g,
      (_, dependency_name, output_name) => {
        const dependency_node_id = CloudNode.genId({
          type: 'secret',
          name: output_name,
          component: dependency_name,
        });
        graph.insertEdges(
          new CloudEdge({
            from: from_id,
            to: dependency_node_id,
            required: true,
          }),
        );
        return `\${{ ${dependency_node_id}.value }}`;
      },
    ),
  );
};

const parseDependencyInterfaceRefs = <T extends Record<string, any>>(
  graph: CloudGraph,
  context: GraphContext,
  from_id: string,
  inputs: T,
): T => {
  return JSON.parse(
    JSON.stringify(inputs).replace(
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
            from: from_id,
            to: dependency_node_id,
            required: true,
          }),
        );

        return `\${{ ${dependency_node_id}.${key} }}`;
      },
    ),
  );
};

const parseDependencyIngressRefs = <T extends Record<string, any>>(
  graph: CloudGraph,
  context: GraphContext,
  from_id: string,
  inputs: T,
): T => {
  return JSON.parse(
    JSON.stringify(inputs).replace(
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
            from: from_id,
            to: dependency_node_id,
            required: true,
          }),
        );
        return `\${{ ${dependency_node_id}.${key} }}`;
      },
    ),
  );
};

const parseServiceInterfaceRefs = <T extends Record<string, any>>(
  graph: CloudGraph,
  context: GraphContext,
  from_id: string,
  inputs: T,
): T => {
  return JSON.parse(
    JSON.stringify(inputs).replace(
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
            from: from_id,
            to: service_node_id,
            required: true,
          }),
        );

        return `\${{ ${service_node_id}.${key} }}`;
      },
    ),
  );
};

const parseComponentInterfaceRefs = <T extends Record<string, any>>(
  graph: CloudGraph,
  context: GraphContext,
  from_id: string,
  inputs: T,
): T => {
  return JSON.parse(
    JSON.stringify(inputs).replace(
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
            from: from_id,
            to: interface_node_id,
            required: true,
          }),
        );

        return `\${{ ${interface_node_id}.${key} }}`;
      },
    ),
  );
};

const parseComponentIngressRefs = <T extends Record<string, any>>(
  graph: CloudGraph,
  context: GraphContext,
  from_id: string,
  inputs: T,
): T => {
  return JSON.parse(
    JSON.stringify(inputs).replace(
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
            from: from_id,
            to: ingress_node_id,
            required: true,
          }),
        );
        return `\${{ ${ingress_node_id}.${key} }}`;
      },
    ),
  );
};

const parseEnvironmentRefs = <T extends Record<string, any>>(
  context: GraphContext,
  inputs: T,
): T => {
  return JSON.parse(
    JSON.stringify(inputs).replace(
      /\${{\s*environment\.name\s*}}/g,
      () => context.environment,
    ),
  );
};

export const parseExpressionRefs = <T extends Record<string, any>>(
  graph: CloudGraph,
  context: GraphContext,
  from_id: string,
  inputs: T,
): T => {
  inputs = parseSecretRefs(graph, context, from_id, inputs);
  inputs = parseDatabaseRefs(graph, context, from_id, inputs);
  inputs = parseDependencyOutputRefs(graph, context, from_id, inputs);
  inputs = parseDependencyInterfaceRefs(graph, context, from_id, inputs);
  inputs = parseDependencyIngressRefs(graph, context, from_id, inputs);
  inputs = parseServiceInterfaceRefs(graph, context, from_id, inputs);
  inputs = parseComponentInterfaceRefs(graph, context, from_id, inputs);
  inputs = parseComponentIngressRefs(graph, context, from_id, inputs);
  inputs = parseEnvironmentRefs(context, inputs);
  return inputs;
};
