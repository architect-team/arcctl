import * as ESTree from 'estree';

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
export const getContextValueByPath = (context: any, path: string): any => {
  const pathParts = path.split('.');
  const firstPart = pathParts.shift();
  if (!firstPart) {
    return context;
  }

  // Handle splat operator
  if (Array.isArray(context) && firstPart !== '*') {
    return undefined;
  } else if (Array.isArray(context)) {
    const res = context.map((item) => getContextValueByPath(item, pathParts.join('.')));
    if (res.every((item) => item === undefined)) {
      return undefined;
    }

    return res;
  } else if (typeof context === 'object') {
    return getContextValueByPath(context[firstPart] ?? undefined, pathParts.join('.'));
  }

  return undefined;
};
