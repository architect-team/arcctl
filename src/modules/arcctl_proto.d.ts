export interface ArcctlPulumi {
  Build(request: BuildRequest): Promise<BuildResponse>;
  Apply(request: ApplyRequest): Promise<ApplyResponse>;
}

export interface BuildRequest {
  directory?: string;
}

export interface BuildResponse {
  image?: string;
}

export interface ApplyRequest {
  pulumistate?: string;
  datacenterid?: string;
  image?: string;
  inputs?: Record<string, string>;
  destroy?: boolean;
}

export interface ApplyResponse {
  pulumistate?: string;
}

export interface HelloReply {
  message?: string;
  time?: string;
}
