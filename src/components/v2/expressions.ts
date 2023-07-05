import { CloudEdge, CloudGraph, CloudNode } from '../../cloud-graph/index.ts';
import { GraphContext } from '../component.ts';
import { DependencySchemaV2 } from './dependency.ts';

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

const parseBuildRefs = <T extends Record<string, any>>(
  graph: CloudGraph,
  context: GraphContext,
  from_id: string,
  inputs: T,
): T => {
  return JSON.parse(
    JSON.stringify(inputs).replace(
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
            from: from_id,
            to: build_node_id,
            required: true,
          }),
        );

        return `\${{ ${build_node_id}.${key} }}`;
      },
    ),
  );
};

const parseServiceRefs = <T extends Record<string, any>>(
  graph: CloudGraph,
  context: GraphContext,
  from_id: string,
  inputs: T,
): T => {
  return JSON.parse(
    JSON.stringify(inputs).replace(
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

const parseIngressRefs = <T extends Record<string, any>>(
  graph: CloudGraph,
  context: GraphContext,
  from_id: string,
  inputs: T,
): T => {
  return JSON.parse(
    JSON.stringify(inputs).replace(
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

const parseDependencyOutputRefs = <T extends Record<string, any>>(
  graph: CloudGraph,
  dependencies: Record<string, DependencySchemaV2>,
  from_id: string,
  inputs: T,
): T => {
  return JSON.parse(
    JSON.stringify(inputs).replace(
      /\${{\s?dependencies\.([\w/-]+)\.outputs\.([\w-]+)\s?}}/g,
      (_, dependency_name, output_name) => {
        const dep = dependencies[dependency_name];
        if (!dep) {
          throw new Error(`Invalid dependency reference: ${dependency_name}`);
        }

        const dependency_node_id = CloudNode.genId({
          type: 'secret',
          name: output_name,
          component: dep.component,
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

const parseDependencyServiceRefs = <T extends Record<string, any>>(
  graph: CloudGraph,
  dependencies: Record<string, DependencySchemaV2>,
  context: GraphContext,
  from_id: string,
  inputs: T,
): T => {
  return JSON.parse(
    JSON.stringify(inputs).replace(
      /\${{\s?dependencies\.([\w/-]+)\.services\.([\w-]+)\.([\dA-Za-z]+)\s?}}/g,
      (_, dependency_name, service_name, key) => {
        const dep = dependencies[dependency_name];
        if (!dep) {
          throw new Error(`Invalid dependency reference: ${dependency_name}`);
        }

        const dependency_node_id = CloudNode.genId({
          type: 'service',
          name: service_name,
          component: dep.component,
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
  dependencies: Record<string, DependencySchemaV2>,
  context: GraphContext,
  from_id: string,
  inputs: T,
): T => {
  return JSON.parse(
    JSON.stringify(inputs).replace(
      /\${{\s?dependencies\.([\w/-]+)\.ingresses\.([\w-]+)\.([\dA-Za-z]+)\s?}}/g,
      (_, dependency_name, ingress_name, key) => {
        const dep = dependencies[dependency_name];
        if (!dep) {
          throw new Error(`Invalid dependency reference: ${dependency_name}`);
        }

        const dependency_node_id = CloudNode.genId({
          type: 'ingressRule',
          name: ingress_name,
          component: dep.component,
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

export const parseExpressionRefs = <T extends Record<string, any>>(
  graph: CloudGraph,
  dependencies: Record<string, DependencySchemaV2>,
  context: GraphContext,
  from_id: string,
  inputs: T,
): T => {
  inputs = parseSecretRefs(graph, context, from_id, inputs);
  inputs = parseDatabaseRefs(graph, context, from_id, inputs);
  inputs = parseBuildRefs(graph, context, from_id, inputs);
  inputs = parseServiceRefs(graph, context, from_id, inputs);
  inputs = parseIngressRefs(graph, context, from_id, inputs);
  inputs = parseDependencyOutputRefs(graph, dependencies, from_id, inputs);
  inputs = parseDependencyServiceRefs(
    graph,
    dependencies,
    context,
    from_id,
    inputs,
  );
  inputs = parseDependencyIngressRefs(
    graph,
    dependencies,
    context,
    from_id,
    inputs,
  );
  return inputs;
};
