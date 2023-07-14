export type ContainerPushInputs = {
  digest: string;
  name: string;
  namespace?: string;
  registry?: string;
  tag?: string;
};

export default ContainerPushInputs;
