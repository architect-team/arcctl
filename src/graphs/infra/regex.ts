export const MODULES_REGEX = /\$\{[^}]*(module\.([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+))[^}]*\}/g;

export const VARIABLES_REGEX = /".*\$\{+\s*module\.([a-zA-Z0-9_-]+)\s*\}+"/g;
