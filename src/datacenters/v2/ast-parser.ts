import * as LooseParser from 'acorn-loose';
import * as estraverse from 'estraverse';
import * as ESTree from 'https://esm.sh/v124/@types/estree@1.0.1/index.d.ts';
import * as jp from 'jsonpath';
const JsonPath = (jp as any).default as typeof jp;

function instanceOf<T>(object: any, key: string): object is T {
  return key in object;
}

const convertObjectExpressionToObject = (node: ESTree.ObjectExpression | ESTree.Literal) => {
  if (!node) {
    return undefined;
  }
  if (node.type === 'Literal' && typeof node.value === 'object') {
    return node.value;
  }
  let obj: any = {};
  if ('properties' in node) {
    (node.properties as Array<ESTree.Property>).forEach((property: ESTree.Property) => {
      if ('name' in property.key) {
        if (property.value.type === 'ObjectExpression') {
          obj[property.key.name] = convertObjectExpressionToObject(property.value);
        } else if ('value' in property.value) {
          obj[property.key.name] = property.value.value;
        }
      }
    });
  } else if (node.type === 'Literal' && typeof node.value === 'object') {
    obj = node.value;
  }
  return obj;
};

type ESTreeNode = {
  type: string;
  [key: string]: any;
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

const isNotPrimitive = (value: any) => typeof value === 'object' || Array.isArray(value);

const parseIdentifier = (node: ESTree.Node) => {
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

const isIdentifier = (node: ESTree.Node) => {
  const identifiers = ['Identifier', 'MemberExpression', 'VariableDeclaration'];
  return identifiers.includes(node.type);
};

const getValuesForContext = (context: Record<string, any>, path: string) => {
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
  return values;
};

const handleAst = (ast: any, context: Record<string, any>): string[] => {
  const notFound: string[] = [];
  estraverse.replace(ast, {
    enter: (node, parent) => {
      if (node.type === 'EmptyStatement') {
        return estraverse.VisitorOption.Remove;
      }

      if (node.type === 'VariableDeclaration') {
        return estraverse.VisitorOption.Remove;
      }

      if (isIdentifier(node)) {
        if ((parent as any)?.callee === node && 'name' in node) {
          return {
            type: 'Literal',
            value: node.name,
          };
        }
        const context_key = parseIdentifier(node);
        const value = getValuesForContext(context, context_key);
        if (value) {
          return {
            type: 'Literal',
            value: value,
          };
        } else {
          const isAlreadyInList = notFound.filter((v) => {
            return v.indexOf(context_key) !== -1;
          }).length > 0;
          if (!isAlreadyInList && context_key !== '✖' && !notFound.includes(context_key)) {
            notFound.push(context_key);
          }
          return estraverse.VisitorOption.Skip;
        }
      }
    },
    leave: (node) => {
      if (node.type === 'ExpressionStatement') {
        if (node.expression.type === 'Literal') {
          return {
            type: 'Literal',
            value: node.expression.value,
          };
        } else if (node.expression.type === 'SequenceExpression' || node.expression.type === 'TemplateLiteral') {
          return {
            type: 'Literal',
            value: node.expression.expressions.map((v) => (v as any).value),
          };
        }
      }
      if (node.type === 'UnaryExpression') {
        let value;
        if (node.operator === '!') {
          if (node.argument.type !== 'Literal') {
            throw new Error(`Unsupported node.argument.type: ${node.argument.type} node.type: ${node.type}`);
          }
          value = !node.argument.value;
        } else if (node.operator === '-') {
          if (node.argument.type !== 'Literal') {
            throw new Error(`Unsupported node.argument.type: ${node.argument.type} node.type: ${node.type}`);
          }
          value = -(node.argument.value || 0);
        } else {
          throw new Error(`Unsupported node.operator: ${node.operator} node.type: ${node.type}`);
        }
        return {
          type: 'Literal',
          value: value,
        };
      } else if (node.type === 'ConditionalExpression') {
        if (node.test.type === 'Literal' && node.consequent.type === 'Literal' && node.alternate.type === 'Literal') {
          return {
            type: 'Literal',
            value: node.test.value ? node.consequent.value : node.alternate.value,
          };
        }
      } else if (node.type === 'BinaryExpression') {
        if (node.left.type !== 'Literal' || node.right.type !== 'Literal') {
          return;
        }
        if (!node.left.value || !node.right.value) {
          return;
        }
        const left_value = node.left.value.toString().trim();
        const right_value = node.right.value.toString().trim();
        let value;
        if (node.operator === '==') {
          value = left_value == right_value;
        } else if (node.operator === '!=') {
          value = left_value != right_value;
        } else if (node.operator === '>') {
          value = left_value > right_value;
        } else if (node.operator === '>=') {
          value = left_value >= right_value;
        } else if (node.operator === '<') {
          value = left_value < right_value;
        } else if (node.operator === '<=') {
          value = left_value <= right_value;
        } else if (node.operator === '+') {
          value = left_value + right_value;
        } else if (node.operator === '-') {
          value = parseFloat(left_value) - parseFloat(right_value);
        } else if (node.operator === '*') {
          value = parseFloat(left_value) * parseFloat(right_value);
        } else if (node.operator === '/') {
          value = parseFloat(left_value) / parseFloat(right_value);
        } else {
          throw new Error(`Unsupported node.operator: ${node.operator} node.type: ${node.type}`);
        }
        return {
          type: 'Literal',
          value: value,
        };
      } else if (node.type === 'LogicalExpression') {
        if (node.left.type !== 'Literal' || node.right.type !== 'Literal') {
          return;
        }
        const left_value = node.left.value;
        const right_value = node.right.value;
        let value;
        if (node.operator === '&&') {
          value = left_value && right_value;
        } else if (node.operator === '||') {
          value = left_value || right_value;
        } else {
          throw new Error(`Unsupported node.operator: ${node.operator} node.type: ${node.type}`);
        }
        return {
          type: 'Literal',
          value: value,
        };
      } else if (node.type === 'CallExpression') {
        let value;
        const func_name = ('value' in node.callee)
          ? node.callee.value
          : ('name' in node.callee)
          ? node.callee.name
          : undefined;
        if (!func_name) {
          throw new Error(`No function name for node.type: ${node.type}`);
        }
        if (func_name === 'trim') {
          if (!('value' in node.arguments[0])) {
            throw new Error(`Unsupported node.arguments[0].type: ${node.arguments[0].type} node.type: ${node.type}`);
          }
          value = node.arguments[0].value?.toString().trim();
        } else if (func_name === 'merge') {
          if (!('arguments' in node)) {
            throw new Error(`Unsupported node.arguments for node.type: ${node}`);
          }
          value = {
            ...convertEstreeNodeToObject(node.arguments[0] as any),
            ...convertEstreeNodeToObject(node.arguments[1] as any),
          };
        } else if (func_name === 'toUpper') {
          if (!instanceOf<ESTree.Literal>(node.arguments[0], 'value')) {
            throw new Error(`Unsupported node.arguments[0].type: ${node.arguments[0].type} node.type: ${node.type}`);
          }
          value = node.arguments[0].value?.toString().toUpperCase();
        } else if (func_name === 'startsWith') {
          if (!instanceOf<ESTree.Literal>(node.arguments[0], 'value')) {
            throw new Error(`Unsupported node.arguments[0].type: ${node.arguments[0].type} node.type: ${node.type}`);
          }
          if (!instanceOf<ESTree.Literal>(node.arguments[1], 'value')) {
            throw new Error(`Unsupported node.arguments[0].type: ${node.arguments[1].type} node.type: ${node.type}`);
          }
          value = node.arguments[0].value?.toString().startsWith(node.arguments[1].value?.toString() || '');
        } else {
          throw new Error(`Unsupported node.type: ${node.type}`);
        }
        return {
          type: 'Literal',
          value: value,
        };
      } else if (node.type === 'IfStatement') {
        if (node.test.type === 'Literal') {
          return {
            type: 'Literal',
            value: Boolean(node.test.value),
          };
        } else {
          throw new Error(`Unsupported node.test.type: ${node.test.type}`);
        }
      }
    },
  });
  return notFound;
};

export const stringMustacheReplace = (str: string, replacer: (matcher: string, key: string) => string) => {
  let result = str;
  let start = 0;
  while (true) {
    const index = result.indexOf('${', start);
    if (index === -1) {
      break;
    }
    let braceCount = 1;
    for (let i = index + 2; i < result.length; i++) {
      if (result[i] === '{') {
        braceCount++;
      } else if (result[i] === '}') {
        braceCount--;
      }
      if (braceCount === 0) {
        const match = result.substring(index, i + 1);
        const key = result.substring(index + 2, i);
        const value = replacer(match, key);
        result = result.substring(0, index) + value + result.substring(i + 1);
        start = index + value.length;
        break;
      }
    }
  }
  return result;
};

export const applyContextRecursive = (obj: Record<string, any>, context: Record<string, any>) => {
  let notFound: string[] = [];
  let previous = '';
  while (previous !== JSON.stringify(obj)) {
    previous = JSON.stringify(obj);
    notFound = applyContext(obj, context);
  }
  return notFound;
};

export const applyContext = (obj: Record<string, any>, context: Record<string, any>) => {
  let notFound: string[] = [];
  Object.entries(obj).forEach(([key, value]) => {
    if (!value) {
      return;
    }
    if (isNotPrimitive(value)) {
      notFound = [
        ...notFound,
        ...applyContext(value, context),
      ];
      return notFound;
    }
    obj[key] = stringMustacheReplace(value.toString(), (match: string, p1: string) => {
      const value = p1.replaceAll(/=+/g, (match) => {
        return match.length === 1 ? ':' : match;
      });
      const ast = LooseParser.parse(
        value,
        { ecmaVersion: 2020 },
      );
      notFound = [
        ...notFound,
        ...handleAst(ast, context),
      ];
      let result;
      if (ast.body.length === 1 && ast.body[0].type === 'Literal' && ast.body[0].value) {
        if (isNotPrimitive(ast.body[0].value)) {
          result = `JSON:${JSON.stringify(ast.body[0].value)}`;
        } else {
          result = ast.body[0].value;
        }
      }
      if (result) {
        return result;
      }
      return match;
    });
    if (obj[key].startsWith('JSON:')) {
      obj[key] = JSON.parse(obj[key].substring(5));
    }
  });
  return notFound;
};
