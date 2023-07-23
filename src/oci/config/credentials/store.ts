import { AuthConfig } from '../types/auth.ts';

export interface Store {
  erase(serverAddress: string): Promise<void>;
  get(serverAddress: string): Promise<AuthConfig | undefined>;
  getAll(): Promise<Record<string, AuthConfig>>;
  store(authConfig: AuthConfig): Promise<void>;
  isFileStore(): boolean;
}
