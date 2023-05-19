type InterfaceWithUrlSchemaV1 = {
  /**
   * The url of the downstream interfaces that should be exposed. This will usually be a reference to one of your services interfaces.
   */
  url: string;
};

export type InterfaceSchemaV1 = InterfaceWithUrlSchemaV1 & {
  /**
   * A human-readable description of the interface and how it should be used.
   */
  description?: string;

  /**
   * Ingress configuration to allow the interface to be exposed publicly
   */
  ingress?: {
    /**
     * Subdomain the interface should be accessed on
     */
    subdomain?: string;

    /**
     * Path that the interface should be exposed under
     */
    path?: string;

    /**
     * Indicates whether the ingress rule should be attached to a public or private load balancer
     * @default false
     */
    internal?: boolean;
  };
};
