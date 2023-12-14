export type ImageManifest = {
  schemaVersion: number;
  mediaType: string;
  artifactType?: string;
  config: {
    digest: string;
    mediaType: string;
    size: number;
  };
  layers: Array<{
    digest: string;
    mediaType: string;
    size: number;
  }>;
  annotations?: Record<string, string>;
};
