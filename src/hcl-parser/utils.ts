import { Identifier, MemberExpression, Node } from 'estree';

/**
 * Checks if a meber expression starts with a dot
 */
export const startsWithDot = (node: MemberExpression | Identifier): boolean => {
  if (node.type === 'Identifier') {
    return node.name === '✖' || node.name === '.';
  } else if (node.object.type === 'Identifier' || node.object.type === 'MemberExpression') {
    return startsWithDot(node.object);
  }

  return false;
};

/**
 * The acorn parser incorrectly parses splat operators (e.g. nodes.*.name) as a multiplication
 * expression. This function detects that incorrect parsing.
 */
export const isSplatOperation = (node: Node) => {
  return node.type === 'BinaryExpression' &&
    node.operator === '*' &&
    node.left.type === 'MemberExpression' &&
    node.left.property.type === 'Identifier' &&
    node.left.property.name === '✖' &&
    node.right.type === 'MemberExpression' &&
    startsWithDot(node.right);
};

/**
 * Replaces a splat operator in the input node with the replacement expression
 */
export const replaceSplatWithExpression = (
  node: MemberExpression | Identifier,
  replacement: MemberExpression,
): MemberExpression | Identifier => {
  if (node.type === 'Identifier' && startsWithDot(node)) {
    return replacement;
  } else if (node.type === 'Identifier') {
    throw new Error('No splat operator found');
  } else if (node.object.type === 'Identifier' || node.object.type === 'MemberExpression') {
    node.object = replaceSplatWithExpression(node.object, replacement);
    return node;
  } else {
    throw new Error(`Cannot replace ${node.object.type} node with splat operator`);
  }
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

/**
 * Convert an object to an ObjectExpression AST node.
 */
export const objectToAst = (input: any): Node => {
  if (Array.isArray(input)) {
    return {
      type: 'ArrayExpression',
      elements: input.map((item) => objectToAst(item) as any),
    };
  } else if (typeof input === 'object') {
    return {
      type: 'ObjectExpression',
      properties: Object.entries(input).map(([key, value]) =>
        ({
          type: 'Property',
          kind: 'init',
          computed: false,
          shorthand: false,
          method: false,
          key: {
            type: 'Identifier',
            name: key,
          },
          value: typeof value === 'object' ? objectToAst(value) : {
            type: 'Literal',
            value,
          },
        }) as any
      ),
    };
  } else {
    return {
      type: 'Literal',
      value: input,
    };
  }
};
