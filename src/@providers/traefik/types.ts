export type TraefikRouter = {
  rule: string;
  service: string;
};

export type TraefikService = {
  loadBalancer: {
    servers: Array<{
      url: string;
    }>;
  };
};

export type TraefikFormattedService = {
  http: {
    routers: {
      [key: string]: TraefikRouter;
    };
    services: {
      [key: string]: TraefikService;
    };
  };
};

export type TraefikFormattedIngressRule = {
  http: {
    routers: {
      [key: string]: TraefikRouter;
    };
  };
};
