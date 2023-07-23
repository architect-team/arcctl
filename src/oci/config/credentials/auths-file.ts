import { AuthConfig } from '../types/auth.ts';

export interface AuthsFile {
  filename: string;
  auths: Record<string, AuthConfig>;
  save(): void;
}
