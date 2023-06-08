export type VolumeInputs = {
  /**
   * Name to give to the volume resource
   */
  name: string;

  /**
   * Path on the host machine to mount the volume to
   */
  hostPath?: string;
};

export default VolumeInputs;
