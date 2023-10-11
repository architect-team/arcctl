import * as ESTree from 'https://esm.sh/v124/@types/estree@1.0.1/index.d.ts';
import * as jp from 'jsonpath';

const JsonPath = (jp as any).default as typeof jp;

/**
 * Returns true if the provided value is NOT a primitive (e.g. an object or array)
 */
export const isNotPrimitive = (value: any) => typeof value === 'object' || Array.isArray(value);

/**
 * Returns true if the ESTree Node represents an entity that can be replaced with context data
 */
export const isIdentifier = (node: ESTree.Node) => {
  const identifiers = ['Identifier', 'MemberExpression', 'VariableDeclaration'];
  return identifiers.includes(node.type);
};

/**
 * Returns a dot-notation string representation of the identifier node
 */
export const flattenIdentifier = (node: ESTree.Node) => {
  if (!isIdentifier(node)) {
    throw new Error(`Node is not an identifier: ${node.type}`);
  }

  if ('name' in node) {
    return node.name;
  }

  const res = [];
  while (node.type === 'MemberExpression') {
    if ('name' in node.property) {
      res.unshift(node.property.name);
    } else if ('value' in node.property) {
      res.unshift(node.property.value);
    }
    if ('name' in node.object) {
      res.unshift(node.object.name);
    }
    if (node.object?.type === 'ThisExpression') {
      res.unshift('this');
    }
    node = node.object;
  }

  // For some reason var is replaced with ✖
  if (res[0] === '✖') {
    res[0] = 'var';
  }

  return res.join('.').trim();
};

/**
 * Retrieves a value (or values) from the provided context object matching the specified, dot-notation path
 */
export const getContextValueByPath = <T = any>(context: Record<string, any>, path: string): T | undefined => {
  if (!path || path === '✖') {
    return undefined;
  }

  const values = JsonPath.query(context, `$.${path}`);
  if (values.length === 0) {
    return undefined;
  }

  if (values.length === 1) {
    return values[0];
  }

  return values as T;
};
