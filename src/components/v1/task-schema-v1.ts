import { DeepPartial } from '../../utils/types.js';
import { RuntimeSchemaV1 } from './common.js';

export type TaskSchemaV1 = RuntimeSchemaV1 & {
  schedule?: string;
};

export type DebuggableTaskSchemaV1 = TaskSchemaV1 & {
  debug?: DeepPartial<TaskSchemaV1>;
};
