import { LooseParser } from 'acorn-loose';
import { generate, GenerateOptions } from 'escodegen';
import estraverse from 'estraverse';
import { Expression, MemberExpression, Node, Program, Super } from 'estree';
import handleFunctions from './functions.ts';
import { getContextValueByPath, isSplatOperation, objectToAst, replaceSplatWithExpression } from './utils.ts';

/**
 * Converts a MemberExpression node to a context path in dot-notation (e.g. node.inputs.name)
 */
const flattenMemberExpression = (exp: Expression | Super): string => {
  if (exp.type === 'MemberExpression') {
    if (exp.property.type !== 'Identifier') {
      throw new Error(
        `Cannot flatten MemberExpression. Expected property.type to be Identifier, got ${exp.property.type}`,
      );
    }

    return `${flattenMemberExpression(exp.object)}.${exp.property.name}`;
  } else if (exp.type === 'Identifier') {
    return exp.name;
  }

  throw new Error(
    `Cannot flatten MemberExpression. Expected type to be Identifier or MemberExpression, but got ${exp.type}`,
  );
};

const astToCode = (ast: Program | Node, genOpts: GenerateOptions): any => {
  switch (ast.type) {
    case 'Program': {
      return astToCode(ast.body[0], genOpts);
    }
    case 'ExpressionStatement': {
      return astToCode(ast.expression, genOpts);
    }
    case 'ObjectExpression': {
      const res: Record<string, any> = {};
      ast.properties.forEach((prop) => {
        if (prop.type === 'Property' && prop.key.type === 'Identifier') {
          res[prop.key.name] = prop.value.type === 'ObjectExpression' || prop.value.type === 'ArrayExpression'
            ? astToCode(prop.value, genOpts)
            : prop.value.type === 'Literal'
            ? prop.value.value
            : generate(prop.value, genOpts).replace(/^'(.*)'$/, '$1');
        }
      });
      return res;
    }
    case 'ArrayExpression': {
      const res: any[] = [];
      ast.elements.forEach((e) => {
        if (e) {
          res.push(astToCode(e, genOpts));
        }
      });
      return res;
    }
    case 'Literal': {
      return ast.value;
    }
    default: {
      return `\${${generate(ast, genOpts)}}`;
    }
  }
};

/**
 * Applies the context to the given object.
 * @param obj Object to apply the context to
 * @param context An object containing values to replace in the object when relevant references are found
 * @param onMatch An optional callback that will be called whenever a match is found
 * @returns An array of references that were not found in the context
 */
export const applyContext = (
  obj: Record<string, any>,
  context: Record<string, any>,
  onMatch?: (context_path: string, value: any) => void,
): string[] => {
  const referencesNotFound: string[] = [];

  let previous = '';
  while (previous !== JSON.stringify(obj)) {
    previous = JSON.stringify(obj);

    Object.entries(obj).forEach(([key, value]) => {
      if (!value) {
        return;
      }

      // Traverse through the object value if its also an object
      if (Array.isArray(value) || typeof value === 'object') {
        return applyContext(value, context, onMatch);
      }

      obj[key] = value.toString().replace(
        /\${(?!{)([^}]*\([^)]*\)[^}]*|[^}]+)}(?!})/g,
        (_: string, expression_str: string) => {
          const ast = LooseParser.parse(expression_str, { ecmaVersion: 2022 });
          estraverse.replace(ast as Node, {
            // In the enter callback, we check for any nodes that aren't formatted correctly by default
            // and correct them into the right AST nodes
            enter: (node, parent) => {
              switch (node.type) {
                case 'BinaryExpression': {
                  // Splat operation correction:
                  // Splat operators are incorrectly categorized as multiplication operations, so
                  // we need to correct it.
                  if (isSplatOperation(node)) {
                    const right = node.right as MemberExpression;
                    const left = node.left as MemberExpression;
                    return replaceSplatWithExpression(right, {
                      ...left,
                      property: {
                        type: 'Identifier',
                        name: '*',
                        ...('start' in left.property ? { start: left.property.start } : {}),
                        ...('end' in left.property ? { end: left.property.end } : {}),
                      },
                    });
                  }

                  break;
                }

                case 'Property': {
                  node.shorthand = false;
                  return node;
                }

                case 'AssignmentExpression': {
                  if (parent?.type === 'Property') {
                    return node.right;
                  }

                  break;
                }

                case 'VariableDeclaration': {
                  // The parser interprets expressions that use `var.*` as variable declarations.
                  // This part removes the invalid declaration.
                  if (
                    node.declarations.length === 1 &&
                    node.declarations[0].type === 'VariableDeclarator' &&
                    node.declarations[0].id.type === 'Identifier' &&
                    node.declarations[0].id.name === '✖'
                  ) {
                    return estraverse.VisitorOption.Remove;
                  }

                  break;
                }

                case 'Identifier': {
                  // The parser interprets expressions that use `var.*` as variable declarations and
                  // automatically assigns a variable name of `✖`. This replaces the variable name with `var` again.
                  if (node.name === '✖') {
                    node.name = 'var';
                    return node;
                  }

                  break;
                }
              }
            },

            // In the leave callback, we handle all our functions and context replacements
            leave: (node, parent) => {
              switch (node.type) {
                case 'MemberExpression': {
                  if (parent?.type !== 'MemberExpression') {
                    const context_path = flattenMemberExpression(node);
                    const value = getContextValueByPath(context, context_path);

                    if (Array.isArray(value)) {
                      onMatch?.(context_path, value);
                      return {
                        type: 'ArrayExpression',
                        elements: value.map((v) => ({
                          type: 'Literal',
                          value: v,
                        })),
                      };
                    } else if (value !== undefined) {
                      onMatch?.(context_path, value);
                      return typeof value === 'object' ? objectToAst(value) : {
                        type: 'Literal',
                        value,
                      };
                    } else {
                      // If the context path includes a splat operator, check the prefix of the splat
                      // and return an empty array if its valid.
                      if ((context_path.includes('.*'))) {
                        const [prefix] = context_path.split('.*');
                        const value = getContextValueByPath(context, prefix);
                        if (value && Array.isArray(value)) {
                          onMatch?.(context_path, []);
                          return {
                            type: 'ArrayExpression',
                            elements: [],
                          };
                        }
                      }

                      if (!referencesNotFound.includes(context_path)) {
                        referencesNotFound.push(context_path);
                      }
                    }
                  }

                  break;
                }

                case 'BinaryExpression': {
                  if (
                    node.left.type === 'Literal' &&
                    node.right.type === 'Literal' &&
                    node.left.value &&
                    node.right.value
                  ) {
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
                  }

                  break;
                }

                case 'LogicalExpression': {
                  if (node.left.type === 'Literal' && node.right.type === 'Literal') {
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
                  }

                  break;
                }

                case 'ConditionalExpression': {
                  if (
                    node.test.type === 'Literal' && node.consequent.type === 'Literal' &&
                    node.alternate.type === 'Literal'
                  ) {
                    return {
                      type: 'Literal',
                      value: node.test.value ? node.consequent.value : node.alternate.value,
                    };
                  }

                  break;
                }

                case 'UnaryExpression': {
                  if (node.argument.type === 'Literal') {
                    if (node.operator === '!') {
                      return {
                        type: 'Literal',
                        value: !node.argument.value,
                      };
                    } else if (node.operator === '-' && typeof node.argument.value === 'number') {
                      return {
                        type: 'Literal',
                        value: -node.argument.value,
                      };
                    }
                  }

                  break;
                }

                case 'CallExpression': {
                  const func_name = ('value' in node.callee)
                    ? node.callee.value
                    : ('name' in node.callee)
                    ? node.callee.name
                    : undefined;

                  if (!func_name) {
                    throw new Error(`No function name for node.type: ${node.type}`);
                  }

                  return handleFunctions(func_name.toString(), node);
                }
              }
            },
          });

          const generate_opts: GenerateOptions = {
            format: {
              quotes: 'auto',
              semicolons: false,
              compact: true,
              parentheses: false,
              escapeless: true,
            },
          };

          const res = astToCode(ast as any, generate_opts);
          if (typeof res === 'object' || Array.isArray(res)) {
            return `JSON:${JSON.stringify(res)}`;
          } else {
            return res;
          }
        },
      );

      if (obj[key].startsWith('JSON:')) {
        obj[key] = JSON.parse(obj[key].substr(5));
      }
    });
  }

  return referencesNotFound;
};
