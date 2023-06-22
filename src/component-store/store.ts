import { Buffer } from 'https://deno.land/std@0.153.0/node/buffer.ts';
import * as crypto from 'https://deno.land/std@0.153.0/node/crypto.ts';
import { copy } from 'std/fs/copy.ts';
import { existsSync } from 'std/fs/exists.ts';
import * as path from 'std/path/mod.ts';
import tar from 'tar';
import { Component } from '../components/component.ts';
import { parseComponent } from '../components/parser.ts';
import { ImageManifest, ImageRepository } from '../oci/index.ts';
import { ComponentStoreDB } from './db.ts';

const CACHE_DB_FILENAME = 'component.db.json';

enum MEDIA_TYPES {
  OCI_MANIFEST = 'application/vnd.oci.image.manifest.v1+json',
}

interface BinaryData {
  digest: string;
  size: number;
  data: Buffer;
}

export interface VolumeConfig {
  component: string;
  mount_path: string;
  host_path: string;
}

class MissingComponentRef extends Error {
  constructor(ref: string) {
    super(`Component not found: ${ref}`);
  }
}

export class ComponentStore {
  private cache_dir: string;
  private db: ComponentStoreDB;
  private default_registry: string;

  constructor(cache_dir: string, default_registry: string) {
    this.cache_dir = cache_dir;
    this.default_registry = default_registry;

    try {
      this.db = JSON.parse(Deno.readTextFileSync(path.join(this.cache_dir, CACHE_DB_FILENAME)));
    } catch {
      this.db = {};
    }
  }

  private save() {
    Deno.writeTextFileSync(path.join(this.cache_dir, CACHE_DB_FILENAME), JSON.stringify(this.db));
  }

  /**
   * Retrieve a component configuration from the local cache
   *
   * @param {ImageRepository} repo - Image repository including metadata about the target component
   * @returns
   */
  async getCachedComponentDetails(repo: ImageRepository): Promise<{
    config_path: string;
    component: Component;
  }> {
    if (!this.db?.[repo.repository]?.[repo.toString()]) {
      throw new MissingComponentRef(repo.toString());
    }

    let config_path = this.db[repo.repository][repo.toString()];
    if (!config_path.startsWith('/')) {
      config_path = path.join(this.cache_dir, config_path);
    }

    return {
      config_path,
      component: await parseComponent(config_path),
    };
  }

  /**
   * Get a component config by its cached ID or fully resolvable image ref. This will first check
   * the local cache before calling out to the registry. The cache will NOT be updated as a result
   * of calling this method.
   */
  async getComponentConfig(ref_or_id: string): Promise<Component> {
    // If the input is an image ID, look for it in the filesystem
    if (/^[\dA-Fa-f]{12}/.test(ref_or_id)) {
      const src_path = path.join(this.cache_dir, ref_or_id, 'architect.json');
      if (!existsSync(src_path)) {
        throw new MissingComponentRef(ref_or_id);
      }

      return parseComponent(src_path);
    }

    const image = new ImageRepository<string>(ref_or_id, this.default_registry);

    try {
      const { component } = await this.getCachedComponentDetails(image);
      return component;
    } catch (ex) {
      const raw_config = await image.getConfig(MEDIA_TYPES.OCI_MANIFEST);
      return parseComponent(raw_config);
    }
  }

  /**
   * Moves the component and its corresponding files into the component cache.
   *
   * @returns {string} - ID of the newly cached artifacts
   */
  async add(component_or_path: string | Component): Promise<string> {
    const component = typeof component_or_path === 'string'
      ? await parseComponent(component_or_path)
      : component_or_path;
    const component_contents = JSON.stringify(component);
    const artifact_id = (crypto
      .createHash('sha256')
      .update(component_contents)
      .setEncoding('utf-8')
      .digest('hex') as string).substring(0, 12);
    const new_path = path.join(this.cache_dir, artifact_id);
    if (!existsSync(new_path)) {
      Deno.mkdirSync(new_path, { recursive: true });
    }
    Deno.writeTextFileSync(path.join(new_path, 'architect.json'), component_contents);
    return artifact_id;
  }

  /**
   * Adds a volume to the component cache.
   *
   * @returns {string} - ID of the newly cached artifacts
   */
  async addVolume(host_path: string): Promise<string> {
    const hash = crypto
      .createHash('sha256');
    const directories = [host_path];
    while (directories.length > 0) {
      const directory = directories.pop() || '';
      const dir = Deno.readDir(directory);
      for await (const entry of dir) {
        if (entry.isDirectory) {
          directories.push(path.join(directory, entry.name));
        }
        const stats = await Deno.stat(path.join(directory, entry.name));
        hash.update(`${entry.name}${stats.mtime}${stats.size}`);
      }
    }
    const artifact_id = hash
      .setEncoding('utf-8')
      .digest('hex') as string;
    const new_path = path.join(this.cache_dir, artifact_id);
    if (!existsSync(new_path)) {
      Deno.mkdirSync(new_path, { recursive: true });
    }
    await copy(host_path, new_path, { overwrite: true });
    return new_path;
  }

  /**
   * Removes the specified component from the local cache
   *
   * @param {string} ref_string - Component reference identifier
   */
  async remove(ref_string: string): Promise<void> {
    try {
      if (/^[\dA-Fa-f]{12}/.test(ref_string)) {
        // If the input is an image ID, look for it in the filesystem
        const src_path = path.join(this.cache_dir, ref_string);
        if (!existsSync(src_path)) {
          throw new MissingComponentRef(ref_string);
        }

        Deno.removeSync(src_path, { recursive: true });
        return;
      }

      const repo = new ImageRepository(ref_string, this.default_registry);
      const { config_path } = await this.getCachedComponentDetails(repo);
      Deno.removeSync(path.dirname(config_path), { recursive: true });

      if (this.db[repo.repository] && this.db[repo.repository][repo.toString()]) {
        delete this.db[repo.repository][repo.toString()];
      }
    } catch (_err) {
      throw new MissingComponentRef(ref_string);
    }
  }

  /**
   * Create a new reference from the src image to the target ref. This only creates a pointer in the cache DB.
   *
   * @param {string} src_ref_or_id - A reference to the source image
   * @param {string} dest_ref - A target reference tag to apply to the image
   */
  tag(src_ref_or_id: string, dest_ref: string): void {
    const dest_match = new ImageRepository(dest_ref, this.default_registry);

    // Ensure the destination repository is in the DB
    this.db[dest_match.repository] = this.db[dest_match.repository] || {};

    if (/^[\dA-Fa-f]{12}/.test(src_ref_or_id)) {
      // If the input is an image ID, look for it in the filesystem
      const src_path = path.join(this.cache_dir, src_ref_or_id, 'architect.json');
      if (!existsSync(src_path)) {
        throw new MissingComponentRef(src_ref_or_id);
      }

      this.db[dest_match.repository][dest_ref] = `./${src_ref_or_id}/architect.json`;
    } else {
      // If the src is an existing tag, create a new pointer in the DB
      const src_match = new ImageRepository(src_ref_or_id, this.default_registry);
      if (!this.db[src_match.repository] || !this.db[src_match.repository][src_ref_or_id]) {
        throw new MissingComponentRef(src_ref_or_id);
      }

      this.db[dest_match.repository][dest_ref] = this.db[src_match.repository][src_ref_or_id];
    }

    this.save();
  }

  /**
   * Push the component from the local cache to the remote registry corresponding with the tag
   *
   * @param {string} ref_string - The component tag to push
   */
  async push(ref_string: string, tar_directory?: string): Promise<void> {
    const repository = new ImageRepository(ref_string, this.default_registry);
    await repository.checkForOciSupport();

    const { component, config_path } = await this.getCachedComponentDetails(repository);

    // Upload the component config
    Deno.writeTextFileSync(config_path, JSON.stringify(component));
    const config_blob = await repository.uploadBlob(config_path);

    // Upload the component directory contents
    if (!tar_directory) {
      tar_directory = Deno.makeTempDirSync();
    }
    const tar_filepath = path.join(tar_directory, 'files-layer.tgz');

    await tar.create({ gzip: true, file: tar_filepath, cwd: path.dirname(config_path) }, ['./']);
    const files_blob = await repository.uploadBlob(tar_filepath);

    // Create and upload the manifest
    const manifest: ImageManifest = {
      schemaVersion: 2,
      mediaType: MEDIA_TYPES.OCI_MANIFEST,
      config: {
        mediaType: 'application/vnd.architect.component.config.v1+json',
        digest: config_blob.digest,
        size: config_blob.size,
      },
      layers: [
        {
          mediaType: 'application/vnd.oci.image.layer.v1.tar+gzip',
          digest: files_blob.digest,
          size: files_blob.size,
        },
      ],
    };

    await repository.uploadManifest(manifest);
  }

  /**
   * Upload a volume to an OCI Registry
   * @param config The volume config to be attached to the manifest
   * @param ref_string The folder to push up as the volume
   * @param tag The tag to tag it all as
   * @param tar_directory Directory to store tar files in for intermediate steps
   */
  async pushVolume(
    config: VolumeConfig,
    ref_string: string,
    tag: string,
    tar_directory?: string,
  ): Promise<void> {
    const volume_repository = new ImageRepository(tag, this.default_registry);
    await volume_repository.checkForOciSupport();

    // Upload the component config
    const config_path = await Deno.makeTempFile();
    Deno.writeTextFileSync(config_path, JSON.stringify(config));
    const config_blob = await volume_repository.uploadBlob(config_path);
    // Upload the component directory contents
    if (!tar_directory) {
      tar_directory = Deno.makeTempDirSync();
    }
    const tar_filepath = path.join(tar_directory, 'files-layer.tgz');

    await tar.create({ gzip: true, file: tar_filepath, cwd: path.join(this.cache_dir, ref_string) }, ['./']);
    const files_blob = await volume_repository.uploadBlob(tar_filepath);

    // Create and upload the manifest
    const manifest: ImageManifest = {
      schemaVersion: 2,
      mediaType: MEDIA_TYPES.OCI_MANIFEST,
      config: {
        mediaType: 'application/vnd.architect.volume.config.v1+json',
        digest: config_blob.digest,
        size: config_blob.size,
      },
      layers: [
        {
          mediaType: 'application/vnd.oci.image.layer.v1.tar+gzip',
          digest: files_blob.digest,
          size: files_blob.size,
        },
      ],
    };

    await volume_repository.uploadManifest(manifest);
  }

  /**
   * Update the local cache with the full contents of the specified component from the matching
   * remote registry.
   */
  async pull(ref_string: string, media_type: string = MEDIA_TYPES.OCI_MANIFEST): Promise<void> {
    const repository = new ImageRepository<Component>(ref_string, this.default_registry);
    const manifest = await repository.getManifest(media_type);

    if (manifest.layers.length <= 0) {
      throw new Error('No files associated with manifest');
    }

    const layer = manifest.layers[0];
    const file = await repository.downloadBlob(layer.digest);
    const store_dir = path.join(this.cache_dir, manifest.config.digest.replace(/^sha256:/, ''));
    if (!existsSync(store_dir)) {
      Deno.mkdirSync(store_dir, { recursive: true });
    }

    if (layer.mediaType.endsWith('tar+gzip') || layer.mediaType.endsWith('tar')) {
      await tar.extract({ file, cwd: store_dir });
    }

    this.add(path.join(store_dir, 'architect.json'));
  }
}
