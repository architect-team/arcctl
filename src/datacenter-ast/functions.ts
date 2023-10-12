import * as ESTree from 'estree';

function instanceOf<T>(object: any, key: string): object is T {
  return key in object;
}

type ESTreeNode = {
  type: string;
  [key: string]: any;
};

const trim = (node: ESTree.CallExpression) => {
  if (!('value' in node.arguments[0])) {
    throw new Error(`Unsupported node.arguments[0].type: ${node.arguments[0].type} node.type: ${node.type}`);
  }
  return node.arguments[0].value?.toString().trim();
};

const merge = (node: ESTree.CallExpression) => {
  if (!('arguments' in node)) {
    throw new Error(`Unsupported node.arguments for node.type: ${node}`);
  }
  return {
    ...convertEstreeNodeToObject(node.arguments[0] as any),
    ...convertEstreeNodeToObject(node.arguments[1] as any),
  };
};

const toUpper = (node: ESTree.CallExpression) => {
  if (!instanceOf<ESTree.Literal>(node.arguments[0], 'value')) {
    throw new Error(`Unsupported node.arguments[0].type: ${node.arguments[0].type} node.type: ${node.type}`);
  }
  return node.arguments[0].value?.toString().toUpperCase();
};

const toLower = (node: ESTree.CallExpression) => {
  if (!instanceOf<ESTree.Literal>(node.arguments[0], 'value')) {
    throw new Error(`Unsupported node.arguments[0].type: ${node.arguments[0].type} node.type: ${node.type}`);
  }
  return node.arguments[0].value?.toString().toLowerCase();
};

const startsWith = (node: ESTree.CallExpression) => {
  if (!instanceOf<ESTree.Literal>(node.arguments[0], 'value')) {
    throw new Error(`Unsupported node.arguments[0].type: ${node.arguments[0].type} node.type: ${node.type}`);
  }
  if (!instanceOf<ESTree.Literal>(node.arguments[1], 'value')) {
    throw new Error(`Unsupported node.arguments[0].type: ${node.arguments[1].type} node.type: ${node.type}`);
  }

  return node.arguments[0].value?.toString().startsWith(node.arguments[1].value?.toString() || '').toString();
};

type functionType = (node: ESTree.CallExpression) => any;

const functions: Record<string, functionType> = {
  trim,
  merge,
  toUpper,
  toLower,
  startsWith,
};

const convertEstreeNodeToObject = (node: ESTreeNode, context: any = {}): any => {
  switch (node.type) {
    case 'ObjectExpression':
      return node.properties.reduce((obj: any, prop: ESTreeNode) => {
        const key = prop.key.type === 'Identifier' ? prop.key.name : prop.key.value;
        obj[key] = convertEstreeNodeToObject(prop.value);
        return obj;
      }, {});

    case 'ArrayExpression':
      return node.elements.map((element: ESTreeNode) => convertEstreeNodeToObject(element));

    case 'Literal':
      return node.value;

    case 'Identifier':
      return node.name;

    case 'MemberExpression': {
      const objectPath = convertEstreeNodeToObject(node.object);
      const propertyPath = node.computed ? convertEstreeNodeToObject(node.property) : node.property.name;
      if (objectPath.startsWith('module.')) {
        return `\${ ${objectPath}.${propertyPath} }`;
      }
      return `${objectPath}.${propertyPath}`;
    }

    default:
      throw new Error(`Unhandled ESTree node type: ${node.type}`);
  }
};

const handleFunctions = (func_name: string, node: ESTree.CallExpression) => {
  const func = functions[func_name];
  if (!func) {
    throw new Error(`Unsupported function: ${func_name}`);
  }
  return func(node);
};

export default handleFunctions;
