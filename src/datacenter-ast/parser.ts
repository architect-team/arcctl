import * as LooseParser from 'acorn-loose';
import * as estraverse from 'estraverse';
import handleFunctions from './functions.ts';
import { flattenIdentifier, getContextValueByPath, isIdentifier, isNotPrimitive } from './utils.ts';

const handleAst = (ast: any, context: Record<string, any>): string[] => {
  const notFound: string[] = [];
  estraverse.replace(ast, {
    enter: (node, parent) => {
      if (['EmptyStatement', 'VariableDeclaration'].includes(node.type)) {
        return estraverse.VisitorOption.Remove;
      }

      if (isIdentifier(node)) {
        if ((parent as any)?.callee === node && 'name' in node) {
          return {
            type: 'Literal',
            value: node.name,
          };
        }

        const context_path = flattenIdentifier(node);
        const value = getContextValueByPath(context, context_path);
        if (value !== undefined) {
          return {
            type: 'Literal',
            value: value,
          };
        } else {
          const isAlreadyInList = notFound.some((v) => v.indexOf(context_path) !== -1);
          if (!isAlreadyInList && context_path !== '✖' && !notFound.includes(context_path)) {
            notFound.push(context_path);
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
      } else if (node.type === 'UnaryExpression') {
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
        };
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
        };
      } else if (node.type === 'CallExpression') {
        const func_name = ('value' in node.callee)
          ? node.callee.value
          : ('name' in node.callee)
          ? node.callee.name
          : undefined;
        if (!func_name) {
          throw new Error(`No function name for node.type: ${node.type}`);
        }
        return {
          type: 'Literal',
          value: handleFunctions(func_name.toString(), node),
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
