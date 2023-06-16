import { Buffer } from 'https://deno.land/std@0.153.0/node/buffer.ts';
import * as crypto from 'https://deno.land/std@0.153.0/node/crypto.ts';
import { createWriteStream } from 'node:fs';
import os from 'node:os';
import { URL } from 'node:url';
import * as path from 'std/path/mod.ts';
import { InvalidImageFormat } from './errors.ts';
import { ImageManifest } from './image-manifest.ts';
import { fileToBinaryData, IMAGE_REGEXP } from './utils.ts';

export class ImageRepository<C extends any = any> {
  protocol: string;
  registry: string;
  repository: string;
  tag?: string;
  digest?: string;

  private default_registry: string;
  private manifest?: ImageManifest;
  private config?: C;

  constructor(ref_string: string, default_registry?: string) {
    const match = ref_string.match(IMAGE_REGEXP);
    if (!match) {
      throw new InvalidImageFormat(ref_string);
    }

    this.default_registry = default_registry || 'registry.docker.com';
    this.registry = match[1] || '';
    this.repository = match[2];
    this.protocol = this.boldlyAssumeProtocol();

    if (!match[3]) {
      this.tag = 'latest';
    } else if (match[3].startsWith('@')) {
      this.digest = match[3].substring(1);
    } else {
      this.tag = match[3].substring(1);
    }
  }

  private boldlyAssumeProtocol() {
    // https://github.com/google/go-containerregistry/blob/efb7e1b888e142e2c66af20fd44e76a939b2cc3e/pkg/name/registry.go#L28
    // via https://github.com/davidthor/nodejs-container-image-builder/blob/bafaf93e172cdd41e3e84d7bbbb134053c2a8cfc/src/image-specifier.ts#L81
    const registry = this.getRegistry();

    if (/.*\.local(?:host)?(?::\d{1,5})?$/.test(registry)) return 'http';
    if (registry.indexOf('localhost:') > -1) return 'http';
    if (registry.indexOf('127.0.0.1') > -1) return 'http';
    if (registry.indexOf('::1') > -1) return 'http';

    return 'https';
  }

  getRegistry() {
    return this.registry || this.default_registry;
  }

  getRegistryUrl() {
    return this.protocol + '://' + this.getRegistry();
  }

  toString() {
    let res = this.repository;
    res += this.tag ? `:${this.tag}` : `@${this.digest}`;
    res = this.registry ? `${this.registry}/${res}` : res;
    return res;
  }

  async checkForOciSupport() {
    try {
      await fetch(`${this.getRegistryUrl()}/v2/`);
    } catch (err: any) {
      if (err.code === 'ECONNREFUSED') {
        throw new Error(
          `Unable to connect to the registry: ${this.getRegistryUrl()}`,
        );
      }

      switch (err.response.status) {
        case '404':
          throw new Error(`Unsupported registry: ${this.getRegistryUrl()}`);
        case '401':
          throw new Error(
            `Authentication required to access registry: ${this.getRegistryUrl()}`,
          );
        default:
          throw new Error(`Unsupported registry: ${this.getRegistryUrl()}`);
      }
    }
  }

  async getManifest(media_type: string): Promise<ImageManifest> {
    if (!this.manifest) {
      const manifest_id = this.tag || this.digest;
      const res = await fetch(`${this.getRegistryUrl()}/v2/${this.repository}/manifests/${manifest_id}`, {
        headers: {
          Accept: media_type,
        },
      });
      this.manifest = await res.json() as ImageManifest;
    }

    return this.manifest!;
  }

  async getConfig(media_type: string): Promise<C> {
    if (!this.config) {
      const manifest = await this.getManifest(media_type);
      const res = await fetch(`${this.getRegistryUrl()}/v2/${this.repository}/blobs/${manifest.config.digest}`);
      this.config = await res.json() as C;
    }

    return this.config!;
  }

  async getBlobMetadata(
    digest: string,
  ): Promise<{ digest: string; size: number } | null> {
    try {
      const { headers } = await fetch(`${this.getRegistryUrl()}/v2/${this.repository}/blobs/${digest}`, {
        method: 'HEAD',
      });

      return {
        size: Number(headers.get('content-length')!),
        digest: headers.get('docker-content-digest')!,
      };
    } catch {
      return null;
    }
  }

  async downloadBlob(digest: string): Promise<string> {
    const filepath = path.join(os.tmpdir(), digest);
    const ws = createWriteStream(filepath);

    const res = await fetch(`${this.getRegistryUrl()}/v2/${this.repository}/blobs/${digest}`, {
      headers: {
        responseType: 'stream',
      },
    });
    const file = await Deno.open(filepath, { create: true, write: true });
    await res.body!.pipeTo(file.writable);
    file.close();

    return filepath;
  }

  async uploadBlob(file: string): Promise<{ digest: string; size: number }> {
    try {
      // Generate digest for the layer
      const { digest, size, data } = await fileToBinaryData(file);

      // Check if the layer already exists
      const existing = await this.getBlobMetadata(digest);
      if (existing && existing.size && existing.digest) {
        return existing;
      }

      const { headers } = await fetch(`${this.getRegistryUrl()}/v2/${this.repository}/blobs/uploads/`, {
        method: 'POST',
      });

      const location = new URL(headers.get('location')!);
      location.searchParams.append('digest', digest);

      const file_binary = await Deno.open(file, { read: true });

      const res = await fetch(location.href, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: file_binary.readable,
      });

      return {
        size,
        digest: res.headers.get('docker-content-digest')!,
      };
    } catch (err) {
      throw new Error('Failed to upload blob to registry');
    }
  }

  async uploadManifest(manifest: ImageManifest) {
    try {
      const manifest_buffer = Buffer.from(JSON.stringify(manifest));
      const manifest_digest = crypto
        .createHash('sha256')
        .update(manifest_buffer)
        .digest('hex');

      const res = await fetch(
        `${this.getRegistryUrl()}/v2/${this.repository}/manifests/${this.tag || manifest_digest}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': manifest.mediaType,
          },
          body: JSON.stringify(manifest),
        },
      );
    } catch (err) {
      throw new Error('Failed to upload manifest to registry');
    }
  }
}
