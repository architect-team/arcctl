export type VolumeInputs = {
  /**
   * Name to give to the volume resource
   * @example "my-volume"
   */
  name: string;

  /**
   * Path on the host machine to mount the volume to
   * @example "/Users/batman/my-volume"
   */
  hostPath?: string;
};

export default VolumeInputs;
