import { AppGraph, AppGraphNode, GraphEdge } from '../../graphs/index.ts';
import { GraphContext } from '../component.ts';

const parseSecretRefs = <T extends Record<string, any>>(
  graph: AppGraph,
  context: GraphContext,
  from_id: string,
  inputs: T,
): T => {
  return JSON.parse(
    JSON.stringify(inputs).replace(
      /\${{\s?(?:parameters|secrets|variables|vars)\.([\w-]+)\s?}}/g,
      (_, input_name) => {
        const input_node_id = `${context.component.name}/secret/${input_name}`;
        graph.insertEdges(
          new GraphEdge({
            from: from_id,
            to: input_node_id,
          }),
        );
        return `\${{ ${input_node_id}.data }}`;
      },
    ),
  );
};

const parseDatabaseRefs = <T extends Record<string, any>>(
  graph: AppGraph,
  context: GraphContext,
  from_id: string,
  inputs: T,
): T => {
  return JSON.parse(
    JSON.stringify(inputs).replace(
      /\${{\s?databases\.([\w-]+)\.([\dA-Za-z_-]+)\s?}}/g,
      (_, database_name, key) => {
        const database_schema_node_id = `${context.component.name}/database/${database_name}`;

        const name = `${from_id}/${database_name}`;
        const database_user_node = new AppGraphNode({
          name,
          type: 'databaseUser',
          component: context.component.name,
          inputs: {
            name: name.replaceAll('/', '--'),
            protocol: `\${{ ${database_schema_node_id}.protocol }}`,
            host: `\${{ ${database_schema_node_id}.host }}`,
            port: `\${{ ${database_schema_node_id}.port }}`,
            username: `\${{ ${database_schema_node_id}.username }}`,
            password: `\${{ ${database_schema_node_id}.password }}`,
            database: `\${{ ${database_schema_node_id}.database }}`,
          },
        });

        graph.insertNodes(database_user_node);
        graph.insertEdges(
          new GraphEdge({
            from: database_user_node.getId(),
            to: database_schema_node_id,
          }),
          new GraphEdge({
            from: from_id,
            to: database_user_node.getId(),
          }),
        );

        return `\${{ ${database_user_node.getId()}.${key} }}`;
      },
    ),
  );
};

const parseDependencyOutputRefs = <T extends Record<string, any>>(
  graph: AppGraph,
  context: GraphContext,
  from_id: string,
  inputs: T,
): T => {
  return JSON.parse(
    JSON.stringify(inputs).replace(
      /\${{\s?dependencies\.([\w/-]+)\.outputs\.([\w-]+)\s?}}/g,
      (_, dependency_name, output_name) => {
        const dependency_node_id = `${dependency_name}/secret/${output_name}`;
        graph.insertEdges(
          new GraphEdge({
            from: from_id,
            to: dependency_node_id,
          }),
        );
        return `\${{ ${dependency_node_id}.value }}`;
      },
    ),
  );
};

const parseDependencyInterfaceRefs = <T extends Record<string, any>>(
  graph: AppGraph,
  context: GraphContext,
  from_id: string,
  inputs: T,
): T => {
  return JSON.parse(
    JSON.stringify(inputs).replace(
      /\${{\s?dependencies\.([\w/-]+)\.interfaces\.([\w-]+)\.([\dA-Za-z_-]+)\s?}}/g,
      (_, dependency_name, interface_name, key) => {
        const dependency_node_id = `${dependency_name}/service/${interface_name}`;
        graph.insertEdges(
          new GraphEdge({
            from: from_id,
            to: dependency_node_id,
          }),
        );

        return `\${{ ${dependency_node_id}.${key} }}`;
      },
    ),
  );
};

const parseDependencyIngressRefs = <T extends Record<string, any>>(
  graph: AppGraph,
  context: GraphContext,
  from_id: string,
  inputs: T,
): T => {
  return JSON.parse(
    JSON.stringify(inputs).replace(
      /\${{\s?dependencies\.([\w/-]+)\.ingresses\.([\w-]+)\.([\dA-Za-z_-]+)\s?}}/g,
      (_, dependency_name, interface_name, key) => {
        const dependency_node_id = `${dependency_name}/ingress/${interface_name}`;
        graph.insertEdges(
          new GraphEdge({
            from: from_id,
            to: dependency_node_id,
          }),
        );
        return `\${{ ${dependency_node_id}.${key} }}`;
      },
    ),
  );
};

const parseServiceInterfaceRefs = <T extends Record<string, any>>(
  graph: AppGraph,
  context: GraphContext,
  from_id: string,
  inputs: T,
): T => {
  return JSON.parse(
    JSON.stringify(inputs).replace(
      /\${{\s?services\.([\w-]+)\.interfaces\.([\w-]+)\.([\dA-Za-z_-]+)\s?}}/g,
      (_, service_name, interface_name, key) => {
        const service_node_id = `${context.component.name}/service/${service_name}-${interface_name}`;
        graph.insertEdges(
          new GraphEdge({
            from: from_id,
            to: service_node_id,
          }),
        );

        return `\${{ ${service_node_id}.${key} }}`;
      },
    ),
  );
};

const parseComponentInterfaceRefs = <T extends Record<string, any>>(
  graph: AppGraph,
  context: GraphContext,
  from_id: string,
  inputs: T,
): T => {
  return JSON.parse(
    JSON.stringify(inputs).replace(
      /\${{\s?interfaces\.([\w-]+)\.([\dA-Za-z_-]+)\s?}}/g,
      (_, interface_name, key) => {
        const interface_node_id = `${context.component.name}/service/${interface_name}`;
        graph.insertEdges(
          new GraphEdge({
            from: from_id,
            to: interface_node_id,
          }),
        );

        return `\${{ ${interface_node_id}.${key} }}`;
      },
    ),
  );
};

const parseComponentIngressRefs = <T extends Record<string, any>>(
  graph: AppGraph,
  context: GraphContext,
  from_id: string,
  inputs: T,
): T => {
  return JSON.parse(
    JSON.stringify(inputs).replace(
      /\${{\s?ingresses\.([\w-]+)\.([\dA-Za-z_-]+)\s?}}/g,
      (_, interface_name, key) => {
        const ingress_node_id = `${context.component.name}/ingress/${interface_name}`;
        graph.insertEdges(
          new GraphEdge({
            from: from_id,
            to: ingress_node_id,
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
  graph: AppGraph,
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
