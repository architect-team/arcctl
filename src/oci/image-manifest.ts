export type ImageManifest = {
  schemaVersion: number;
  mediaType: string;
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
};
