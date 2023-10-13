import * as LooseParser from 'acorn-loose';
import * as estraverse from 'estraverse';
import * as ESTree from 'estree';
import handleFunctions from './functions.ts';
import { flattenIdentifier, getContextValueByPath, isIdentifier, isNotPrimitive } from './utils.ts';

/**
 * Checks if a meber expression starts with a dot
 */
const startsWithDot = (node: ESTree.MemberExpression | ESTree.Identifier): boolean => {
  if (node.type === 'Identifier') {
    return node.name === '✖' || node.name === '.';
  } else if (node.object.type === 'Identifier' || node.object.type === 'MemberExpression') {
    return startsWithDot(node.object);
  }

  return false;
};

/**
 * Replaces a splat operator in the input node with the replacement expression
 */
const replaceSplatWithExpression = (
  node: ESTree.MemberExpression | ESTree.Identifier,
  replacement: ESTree.MemberExpression,
): ESTree.MemberExpression | ESTree.Identifier => {
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
 * The acorn parser incorrectly parses splat operators (e.g. nodes.*.name) as a multiplication
 * expression. This function detects that incorrect parsing.
 */
const isSplatOperation = (node: ESTree.Node) => {
  return node.type === 'BinaryExpression' &&
    node.operator === '*' &&
    node.left.type === 'MemberExpression' &&
    node.left.property.type === 'Identifier' &&
    node.left.property.name === '✖' &&
    node.right.type === 'MemberExpression' &&
    startsWithDot(node.right);
};

const handleAst = (ast: any, context: Record<string, any>): string[] => {
  const notFound: string[] = [];
  estraverse.replace(ast, {
    enter: (node) => {
      if (['EmptyStatement', 'VariableDeclaration'].includes(node.type)) {
        return estraverse.VisitorOption.Remove;
      }

      if (node.type === 'BinaryExpression' && isSplatOperation(node)) {
        const right = node.right as ESTree.MemberExpression;
        const left = node.left as ESTree.MemberExpression;
        node = replaceSplatWithExpression(right, {
          ...left,
          property: {
            type: 'Identifier',
            name: '*',
            ...('start' in left.property ? { start: left.property.start } : {}),
            ...('end' in left.property ? { end: left.property.end } : {}),
          },
        });
      }

      if (isIdentifier(node)) {
        const context_path = flattenIdentifier(node);

        try {
          const value = getContextValueByPath(context, context_path);
          if (Array.isArray(value)) {
            return {
              type: 'ArrayExpression',
              elements: value.map((v) => ({
                type: 'Literal',
                value: v,
              })),
            };
          } else if (value !== undefined) {
            return {
              type: 'Literal',
              value: value,
            };
          } else {
            const isAlreadyInList = notFound.some((v) => v.indexOf(context_path) !== -1);
            if (!isAlreadyInList && context_path !== '✖' && !notFound.includes(context_path)) {
              notFound.push(context_path);
            }
          }
        } catch (err) {
          // This is a hack to catch errors with splat operations, which fails jsonpath parsing due
          // to the odd replacement of "*" with "✖" (e.g. environment.nodes.✖).
          if (err.message.startsWith('Lexical error')) {
            const isAlreadyInList = notFound.some((v) => v.indexOf(context_path) !== -1);
            if (!isAlreadyInList && context_path !== '✖' && !notFound.includes(context_path)) {
              notFound.push(context_path);
            }
          }
        }

        return node;
      }
    },
    leave: (node) => {
      if (node.type === 'ExpressionStatement') {
        if (node.expression.type === 'Literal' && 'value' in node.expression) {
          return {
            type: 'Literal',
            value: node.expression.value,
          } as ESTree.SimpleLiteral;
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
        } as ESTree.SimpleLiteral;
      }

      if (node.type === 'ConditionalExpression') {
        if (node.test.type === 'Literal' && node.consequent.type === 'Literal' && node.alternate.type === 'Literal') {
          return {
            type: 'Literal',
            value: node.test.value ? node.consequent.value : node.alternate.value,
          } as ESTree.SimpleLiteral;
        }
      }

      if (node.type === 'BinaryExpression') {
        if (
          node.left.type !== 'Literal' ||
          node.right.type !== 'Literal' ||
          !node.left.value ||
          !node.right.value
        ) {
          return;
        }

        const left_value = node.left.value.toString().trim();
        const right_value = node.right.value.toString().trim();
        let value;
        if (node.operator === '==') {
          value = (left_value == right_value).toString();
        } else if (node.operator === '!=') {
          value = (left_value != right_value).toString();
        } else if (node.operator === '>') {
          value = (left_value > right_value).toString();
        } else if (node.operator === '>=') {
          value = (left_value >= right_value).toString();
        } else if (node.operator === '<') {
          value = (left_value < right_value).toString();
        } else if (node.operator === '<=') {
          value = (left_value <= right_value).toString();
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
        } as ESTree.SimpleLiteral;
      } else if (node.type === 'LogicalExpression') {
        if (node.left.type !== 'Literal' || node.right.type !== 'Literal') {
          return;
        }
        const left_value = node.left.value;
        const right_value = node.right.value;
        let value;
        if (node.operator === '&&') {
          value = (left_value && right_value)?.toString();
        } else if (node.operator === '||') {
          value = (left_value || right_value)?.toString();
        } else {
          throw new Error(`Unsupported node.operator: ${node.operator} node.type: ${node.type}`);
        }
        return {
          type: 'Literal',
          value: value,
        } as ESTree.SimpleLiteral;
      } else if (node.type === 'CallExpression') {
        const func_name = ('value' in node.callee)
          ? node.callee.value
          : ('name' in node.callee)
          ? node.callee.name
          : undefined;
        if (!func_name) {
          throw new Error(`No function name for node.type: ${node.type}`);
        }

        return handleFunctions(func_name.toString(), node);
      } else if (node.type === 'IfStatement') {
        if (node.test.type === 'Literal') {
          return {
            type: 'Literal',
            value: Boolean(node.test.value),
          } as ESTree.SimpleLiteral;
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
      // No more expressions in string
      break;
    }

    // So we can support `${...}` and `${{...}}` notation with the same function
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
  Object.entries(obj)
    .forEach(([key, value]) => {
      // Nothing to apply context to
      if (!value) {
        return;
      }

      // Drill down until we find literals we can replace with context data
      if (isNotPrimitive(value)) {
        notFound = [
          ...notFound,
          ...applyContext(value, context),
        ];
        return notFound;
      }

      obj[key] = stringMustacheReplace(value.toString(), (match: string, value: string) => {
        const ast = LooseParser.parse(
          value,
          { ecmaVersion: 2022 },
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
