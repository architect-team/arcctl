export type TraefikRouter = {
  rule: string;
  service: string;
  middlewares?: string[];
};

export type TraefikTcpRouter = TraefikRouter & {
  tls: {
    passthrough?: boolean;
  };
};

export type TraefikHttpService = {
  loadBalancer: {
    servers: Array<{
      url: string;
    }>;
  };
};

export type TraefikTcpService = {
  loadBalancer: {
    servers: Array<{
      address: string;
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
    accessControlAllowCredentials?: boolean;
    accessControlAllowMethods?: string[];
    accessControlAllowHeaders?: string;
    accessControlAllowOriginList?: string[];
    accessControlMaxAge?: number;
    addVaryHeader?: boolean;
  };
};

export type TraefikFormattedService = {
  http?: {
    routers: {
      [key: string]: TraefikRouter;
    };
    middlewares?: {
      [key: string]: TraefikMiddleware;
    };
    services: {
      [key: string]: TraefikHttpService;
    };
  };
  tcp?: {
    routers: {
      [key: string]: TraefikTcpRouter;
    };
    middlewares?: {
      [key: string]: TraefikMiddleware;
    };
    services: {
      [key: string]: TraefikTcpService;
    };
  };
};

export type TraefikFormattedIngressRule = {
  http?: {
    routers: {
      [key: string]: TraefikRouter;
    };
    middlewares?: {
      [key: string]: TraefikMiddleware;
    };
  };
  tcp?: {
    routers: {
      [key: string]: TraefikTcpRouter;
    };
    middlewares?: {
      [key: string]: TraefikMiddleware;
    };
  };
};
