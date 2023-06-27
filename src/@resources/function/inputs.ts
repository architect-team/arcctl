export type FunctionInputs = {
  /**
   * Name of the cloud function
   */
  name: string;

  /**
   * Location of the image used to run the cloud function
   */
  image: string;

  /**
   * Region the function should live in
   */
  region: string;
};

export default FunctionInputs;
