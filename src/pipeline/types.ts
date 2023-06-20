import { ProviderStore } from "../@providers/index.ts";
import { Logger } from "winston";
import { ArchitectPlugin } from "../index.ts";

export type ApplyOptions = {
  providerStore: ProviderStore;
  cwd?: string;
  logger?: Logger;
  plugin?: ArchitectPlugin;
};

export type StepAction = "no-op" | "create" | "update" | "delete";

export type StepColor = "blue" | "green";

export type StepStatus = {
  state:
    | "pending"
    | "starting"
    | "applying"
    | "destroying"
    | "complete"
    | "unknown"
    | "error";
  message?: string;
  startTime?: number;
  endTime?: number;
};
