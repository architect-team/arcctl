export type VpcInputs = {
  /**
   * Name of the VPC
   */
  name: string;

  /**
   * Description for the VPC
   */
  description?: string;

  /**
   * Region the VPC exists in
   */
  region: string;
};

export default VpcInputs;
