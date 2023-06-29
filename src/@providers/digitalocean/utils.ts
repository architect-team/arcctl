import { DigitaloceanCredentials } from './credentials.ts';

export enum DigitalOceanApiMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export async function digitalOceanApiRequest(options: {
  credentials: DigitaloceanCredentials;
  path: string;
  method?: DigitalOceanApiMethods;
}): Promise<any> {
  const headers = {
    'Authorization': `Bearer ${options.credentials.token}`,
    'Content-Type': 'application/json',
  };
  const method = options.method || DigitalOceanApiMethods.GET;
  const response = await fetch(`https://api.digitalocean.com/v2${options.path}`, {
    method,
    headers,
  });
  return JSON.parse(await response.text());
}
