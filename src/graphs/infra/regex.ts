export const MODULES_REGEX = [
  /".*\$\{+\s*module\.([a-zA-Z0-9_-]+)\.([^\s]*)\s*\}+"/g,
  /[^".*]module\.([a-zA-Z0-9_-]+)\.([^\s]*)[^.*"]/g,
];

export const VARIABLES_REGEX = [
  /".*\$\{+\s*module\.([a-zA-Z0-9_-]+)\s*\}+"/g,
  /[^".*]module\.([a-zA-Z0-9_-]+)[^.*"]/g,
];
