import { decode as base64Decode, encode as base64Encode } from 'https://deno.land/std@0.195.0/encoding/base64.ts';

export type AuthConfig = {
  username?: string;
  password?: string;
  auth?: string;
  email?: string;
  serveraddress?: string;
  identitytoken?: string;
  registrytoken?: string;
};

export const encodeAuth = (config: AuthConfig): string => {
  if (!config.username || !config.password) {
    return '';
  }

  return base64Encode(`${config.username}:${config.password}`);
};

export const decodeAuth = (auth: string): { username: string; password: string } => {
  if (!auth) {
    return { username: '', password: '' };
  }

  const decoded = new TextDecoder().decode(base64Decode(auth));
  const parts = decoded.split(':');
  if (parts.length !== 2) {
    throw new Error(`auth ${decoded} does not conform to the base64(username:password) format`);
  }

  return { username: parts[0], password: parts[1] };
};
