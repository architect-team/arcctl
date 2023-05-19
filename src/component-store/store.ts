import { Component } from '../components/component.js';
import { parseComponent } from '../components/parser.js';
import { ComponentStoreDB } from './db.js';
import { ImageManifest, ImageRepository } from '@architect-io/arc-oci';
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import tar from 'tar';

const CACHE_DB_FILENAME = 'component.db.json';

enum MEDIA_TYPES {
  OCI_MANIFEST = 'application/vnd.oci.image.manifest.v1+json',
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
      this.db = JSON.parse(
        fs.readFileSync(path.join(this.cache_dir, CACHE_DB_FILENAME), 'utf8'),
      );
    } catch {
      this.db = {};
    }
  }

  private save() {
    fs.writeFileSync(
      path.join(this.cache_dir, CACHE_DB_FILENAME),
      JSON.stringify(this.db),
    );
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
    if (/^[\dA-Fa-f]{64}/.test(ref_or_id)) {
      const src_path = path.join(this.cache_dir, ref_or_id, 'architect.json');
      if (!fs.existsSync(src_path)) {
        throw new MissingComponentRef(ref_or_id);
      }

      return parseComponent(src_path);
    }

    const image = new ImageRepository<string>(ref_or_id, this.default_registry);

    try {
      const { component } = await this.getCachedComponentDetails(image);
      return component;
    } catch {
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
    const component =
      typeof component_or_path === 'string'
        ? await parseComponent(component_or_path)
        : component_or_path;
    const component_contents = JSON.stringify(component);
    const artifact_id = crypto
      .createHash('sha256')
      .update(component_contents)
      .digest('hex');
    const new_path = path.join(this.cache_dir, artifact_id);
    if (!fs.existsSync(new_path)) {
      fs.mkdirSync(new_path, { recursive: true });
    }
    fs.writeFileSync(path.join(new_path, 'architect.json'), component_contents);
    return artifact_id;
  }

  /**
   * Removes the specified component from the local cache
   *
   * @param {string} ref_string - Component reference identifier
   */
  async remove(ref_string: string): Promise<void> {
    try {
      if (/^[\dA-Fa-f]{64}/.test(ref_string)) {
        // If the input is an image ID, look for it in the filesystem
        const src_path = path.join(this.cache_dir, ref_string);
        if (!fs.existsSync(src_path)) {
          throw new MissingComponentRef(ref_string);
        }

        fs.rmSync(src_path, { recursive: true });
        return;
      }

      const repo = new ImageRepository(ref_string, this.default_registry);
      const { config_path } = await this.getCachedComponentDetails(repo);
      fs.rmSync(path.dirname(config_path), { recursive: true });

      if (
        this.db[repo.repository] &&
        this.db[repo.repository][repo.toString()]
      ) {
        delete this.db[repo.repository][repo.toString()];
      }
    } catch (err) {
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

    if (/^[\dA-Fa-f]{64}/.test(src_ref_or_id)) {
      // If the input is an image ID, look for it in the filesystem
      const src_path = path.join(
        this.cache_dir,
        src_ref_or_id,
        'architect.json',
      );
      if (!fs.existsSync(src_path)) {
        throw new MissingComponentRef(src_ref_or_id);
      }

      this.db[dest_match.repository][
        dest_ref
      ] = `./${src_ref_or_id}/architect.json`;
    } else {
      // If the src is an existing tag, create a new pointer in the DB
      const src_match = new ImageRepository(
        src_ref_or_id,
        this.default_registry,
      );
      if (
        !this.db[src_match.repository] ||
        !this.db[src_match.repository][src_ref_or_id]
      ) {
        throw new MissingComponentRef(src_ref_or_id);
      }

      this.db[dest_match.repository][dest_ref] =
        this.db[src_match.repository][src_ref_or_id];
    }

    this.save();
  }

  /**
   * Push the component from the local cache to the remote registry corresponding with the tag
   *
   * @param {string} ref_string - The component tag to push
   */
  async push(ref_string: string): Promise<void> {
    const repository = new ImageRepository(ref_string, this.default_registry);
    await repository.checkForOciSupport();

    const { component, config_path } = await this.getCachedComponentDetails(
      repository,
    );

    // Upload the component config
    fs.writeFileSync(config_path, JSON.stringify(component));
    const config_blob = await repository.uploadBlob(config_path);

    // Upload the component directory contents
    const tar_filepath = path.join(os.tmpdir(), 'files-layer.tgz');
    await tar.create(
      { gzip: true, file: tar_filepath, cwd: path.dirname(config_path) },
      ['./'],
    );
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
   * Update the local cache with the full contents of the specified component from the matching
   * remote registry.
   */
  async pull(
    ref_string: string,
    media_type: string = MEDIA_TYPES.OCI_MANIFEST,
  ): Promise<void> {
    const repository = new ImageRepository<Component>(
      ref_string,
      this.default_registry,
    );
    const manifest = await repository.getManifest(media_type);

    if (manifest.layers.length <= 0) {
      throw new Error('No files associated with manifest');
    }

    const layer = manifest.layers[0];
    const file = await repository.downloadBlob(layer.digest);
    const store_dir = path.join(
      this.cache_dir,
      manifest.config.digest.replace(/^sha256:/, ''),
    );
    if (!fs.existsSync(store_dir)) {
      fs.mkdirSync(store_dir, { recursive: true });
    }

    if (
      layer.mediaType.endsWith('tar+gzip') ||
      layer.mediaType.endsWith('tar')
    ) {
      await tar.extract({ file, cwd: store_dir });
    }

    this.add(path.join(store_dir, 'architect.json'));
  }
}
