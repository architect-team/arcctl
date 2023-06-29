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
  paging?: {
    per_page?: number;
    page?: number;
  };
}): Promise<any> {
  const headers = {
    'Authorization': `Bearer ${options.credentials.token}`,
    'Content-Type': 'application/json',
  };
  const query = new URLSearchParams();
  if (options.paging?.per_page) {
    query.append('per_page', options.paging.per_page.toString());
  }
  const url = `https://api.digitalocean.com/v2${options.path}${query.size > 0 ? '?' + query : ''}`;
  const method = options.method || DigitalOceanApiMethods.GET;
  const response = await fetch(url, {
    method,
    headers,
  });
  if ((await response).status != 200) {
    throw new Error(`DigitalOcean API request failed: ${JSON.stringify(await response.json())}`);
  }
  return JSON.parse(await response.text());
}
