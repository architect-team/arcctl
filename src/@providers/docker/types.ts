export type DockerPsItem = {
  Command: string;
  ID: string;
  Names: string;
  Networks: string;
  State: string;
};

export type DockerInspectionResults = {
  Id: string;
  Created: string;
  Path: string;
  Args: string[];
  State: {
    Status: string;
    Running: boolean;
    Paused: boolean;
    Restarting: boolean;
    Dead: boolean;
  };
  HostConfig: {
    PortBindings: {
      [key: string]: [{
        HostIp: string;
        HostPort: string;
      }];
    };
  };
  Image: string;
  ResolvConfPath: string;
  Name: string;
  Driver: string;
  Platform: string;
  Config: {
    Hostname: string;
    Domainname: string;
    Tty: boolean;
    Cmd: string[];
    Labels: Record<string, string>;
    Env: string[];
    ExposedPorts: {
      // deno-lint-ignore ban-types
      [key: string]: {};
    };
    Entrypoint: string[];
  };
  NetworkSettings: {
    Ports: {
      [key: string]: [{
        HostIp: string;
        HostPort: string;
      }];
    };
    Networks: {
      [key: string]: {
        Aliases: string[];
        NetworkID: string;
        EndpointID: string;
        Gateway: string;
        IPAddress: string;
      };
    };
  };
};

export type DockerInfo = {
  ID: string;
  Containers: number;
  ContainersRunning: number;
  ContainersPaused: number;
  ContainersStopped: number;
  Images: number;
  Driver: string;
  OSType: string;
  Architecture: string;
  NCPU: number;
  MemTotal: number;
  DockerRootDir: string;
  ServerVersion: string;
};
