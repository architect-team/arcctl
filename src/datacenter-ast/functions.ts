import * as ESTree from 'estree';

type ESTreeNode = {
  type: string;
  [key: string]: any;
};

const trim = (node: ESTree.CallExpression): ESTree.CallExpression | ESTree.SimpleLiteral => {
  if (node.arguments.length !== 1) {
    throw new Error(`Expected exactly one argument for the trim() method. Got ${node.arguments.length}.`);
  } else if (node.arguments[0].type === 'MemberExpression') {
    // MemberExpression nodes may be resolved later
    return node;
  } else if (node.arguments[0].type !== 'Literal') {
    throw new Error(`Unsupported argument type for trim(): ${node.arguments[0].type}`);
  }

  return {
    type: 'Literal',
    value: node.arguments[0].value?.toString().trim() || '',
  };
};

const merge = (node: ESTree.CallExpression): ESTree.CallExpression | ESTree.SimpleLiteral => {
  if (node.arguments.length !== 2) {
    throw new Error(`Expected exactly two arguments for the merge() method. Got ${node.arguments.length}.`);
  } else if (node.arguments[0].type === 'MemberExpression' || node.arguments[1].type === 'MemberExpression') {
    // MemberExpression nodes may be resolved later
    return node;
  }

  return {
    type: 'Literal',
    value: {
      ...convertEstreeNodeToObject(node.arguments[0]),
      ...convertEstreeNodeToObject(node.arguments[1]),
    },
  };
};

/**
 * Determines whether an array includes a certain element, returning true or false as appropriate.
 */
const contains = (node: ESTree.CallExpression): ESTree.CallExpression | ESTree.SimpleLiteral => {
  if (node.arguments.length !== 2) {
    throw new Error(`Expected exactly two arguments for the contains() method. Got ${node.arguments.length}.`);
  } else if (node.arguments[0].type === 'MemberExpression' || node.arguments[1].type === 'MemberExpression') {
    // MemberExpression nodes may be resolved later
    return node;
  } else if (node.arguments[0].type !== 'ArrayExpression') {
    console.log(node.arguments[0]);
    throw new Error(`Expected first argument of contains() to be an array.`);
  } else if (!('value' in node.arguments[1])) {
    throw new Error(`Expected second argument of contains() to be a literal.`);
  }

  const arr: string[] = [];
  for (const element of node.arguments[0].elements) {
    if (element?.type !== 'Literal') {
      throw new Error(`Only literals are supported in contains() arrays.`);
    }

    if (element.value) {
      arr.push(element.value.toString());
    }
  }

  const res = Boolean(node.arguments[1].value && arr.includes(node.arguments[1].value.toString()));
  return {
    type: 'Literal',
    value: res.toString(),
  };
};

/**
 * Converts all the alphabetic characters in a string to uppercase.
 */
const toUpper = (node: ESTree.CallExpression): ESTree.CallExpression | ESTree.SimpleLiteral => {
  if (node.arguments[0].type === 'MemberExpression') {
    // MemberExpression nodes may be resolved later
    return node;
  } else if (node.arguments[0].type !== 'Literal') {
    throw new Error(`Unsupported argument type for toUpper(): ${node.arguments[0].type}`);
  }

  return {
    type: 'Literal',
    value: node.arguments[0].value?.toString().toUpperCase() || '',
  };
};

/**
 * Converts all the alphabetic characters in a string to lowercase.
 */
const toLower = (node: ESTree.CallExpression): ESTree.CallExpression | ESTree.SimpleLiteral => {
  if (node.arguments[0].type === 'MemberExpression') {
    // MemberExpression nodes may be resolved later
    return node;
  } else if (node.arguments[0].type !== 'Literal') {
    throw new Error(`Unsupported argument type for toLower(): ${node.arguments[0].type}`);
  }

  return {
    type: 'Literal',
    value: node.arguments[0].value?.toString().toLowerCase() || '',
  };
};

/**
 * Checks if the first argument starts with the second argument.
 */
const startsWith = (node: ESTree.CallExpression): ESTree.CallExpression | ESTree.SimpleLiteral => {
  if (node.arguments[0].type === 'MemberExpression' || node.arguments[1].type === 'MemberExpression') {
    // MemberExpression nodes may be resolved later
    return node;
  } else if (node.arguments[0].type !== 'Literal' || node.arguments[1].type !== 'Literal') {
    throw new Error(
      `Unsupported argument types for startsWith(): ${node.arguments[0].type} and ${node.arguments[1].type}`,
    );
  }

  const res = node.arguments[0].value?.toString().startsWith(node.arguments[1].value?.toString() || '');
  return {
    type: 'Literal',
    value: res === true ? 'true' : 'false',
  };
};

type functionType = (node: ESTree.CallExpression) => ESTree.CallExpression | ESTree.SimpleLiteral;

const functions: Record<string, functionType> = {
  contains,
  trim,
  merge,
  toUpper,
  toLower,
  startsWith,
};

const convertEstreeNodeToObject = (node: ESTreeNode): any => {
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

const handleFunctions = (
  func_name: string,
  node: ESTree.CallExpression,
): ESTree.CallExpression | ESTree.SimpleLiteral => {
  const func = functions[func_name];
  if (!func) {
    throw new Error(`Unsupported function: ${func_name}`);
  }
  return func(node);
};

export default handleFunctions;
