// generated file - do not edit
// see: `types.ts.tpl`

{{#apply_types}}
import type {{name}}ApplyOptions from './{{slug}}/apply/options.ts';
import type {{name}}ApplyOutputs from './{{slug}}/apply/outputs.ts';
{{/apply_types}}
{{#query_types}}
import type {{name}}QueryOptions from './{{slug}}/query/options.ts';
import type {{name}}QueryOutputs from './{{slug}}/query/outputs.ts';
{{/query_types}}

export type ResourceType =
{{#all_types}}
  | '{{.}}'
{{/all_types}};

export type ApplyType =
{{#apply_types}}
  | '{{slug}}'
{{/apply_types}};

export type QueryType =
{{#query_types}}
  | '{{slug}}'
{{/query_types}};

export const ResourceTypeList: ResourceType[] = [
{{#all_types}}
  '{{.}}',
{{/all_types}}
];

export const ApplyTypeList: ApplyType[] = [
{{#apply_types}}
  '{{slug}}',
{{/apply_types}}
];

export const QueryTypeList: QueryType[] = [
{{#query_types}}
  '{{slug}}',
{{/query_types}}
];

export type ApplyOptions = {
{{#apply_types}}
  '{{slug}}': {
    type: '{{slug}}',
    provider: string,
  } & {{name}}ApplyOptions,
{{/apply_types}}
};

export type ApplyOptionsSchema = ApplyOptions[ApplyType];

export type ApplyOutputs = {
  'region': {
    type: 'region',
    id: string,
    provider: string,
  },
{{#apply_types}}
  '{{slug}}': {
    type: '{{slug}}',
    id: string,
    provider: string,
  } & {{name}}ApplyOutputs,
{{/apply_types}}
};

export type QueryOptions = {
{{#query_types}}
  '{{slug}}': {{name}}QueryOptions,
{{/query_types}}
};

export type QueryOutputs = {
{{#query_types}}
  '{{slug}}': {{name}}QueryOutputs,
{{/query_types}}
};