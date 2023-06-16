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

export type TraefikMiddleware = {
  forwardAuth?: {
    address: string;
  };
  headers?: {
    customRequestHeaders?: Record<string, string>;
    customResponseHeaders?: Record<string, string>;
    accessControlAllowMethods?: string;
    accessControlAllowHeaders?: string;
    accessControlAllowOriginList?: string[];
    accessControlMaxAge?: number;
    addVaryHeader?: boolean;
  };
};

export type TraefikFormattedService = {
  http: {
    routers: {
      [key: string]: TraefikRouter;
    };
    middlewares?: {
      [key: string]: TraefikMiddleware;
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
    middlewares?: {
      [key: string]: TraefikMiddleware;
    };
  };
};
