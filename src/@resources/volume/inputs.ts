export type VolumeInputs = {
  /**
   * Path inside the container runtime to mount the volume to
   */
  mountPath: string;

  /**
   * Path on the host machine to mount the volume to
   */
  hostPath?: string;
};

export default VolumeInputs;
