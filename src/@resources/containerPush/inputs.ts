export type ContainerPushInputs = {
  digest: string;
  name: string;
  namespace?: string;
  tag?: string;
};

export default ContainerPushInputs;
