import * as crypto from 'https://deno.land/std@0.153.0/node/crypto.ts';
import * as path from 'std/path/mod.ts';
import tar from 'tar';
import { ComponentStoreDB } from '../component-store/db.ts';
import { InfraGraph } from '../graphs/index.ts';
import { ImageManifest, ImageRepository } from '../oci/index.ts';
import { StateBackend } from '../state-backend/backend.ts';
import { buildStateBackend } from '../state-backend/builder.ts';
import { BaseStore } from '../utils/base-store.ts';
import { ArcctlConfigOptions } from '../utils/config.ts';
import { pathExistsSync } from '../utils/filesystem.ts';
import { Datacenter } from './datacenter.ts';
import { parseDatacenter } from './parser.ts';

export type DatacenterRecord = {
  name: string;
  config: Datacenter;
  priorState: InfraGraph;
};

const CACHE_DB_FILENAME = 'datacenter.db.json';

enum MEDIA_TYPES {
  OCI_MANIFEST = 'application/vnd.oci.image.manifest.v1+json',
}

class MissingDatacenterRef extends Error {
  constructor(ref: string) {
    super(`Datacenter not found: ${ref}`);
  }
}

export type DatacenterStoreOptions = {
  cache_dir: string;
  backendConfig: ArcctlConfigOptions['stateBackendConfig'];
  default_registry?: string;
};

export class DatacenterStore implements BaseStore<DatacenterRecord> {
  private cache_dir: string;
  private db: ComponentStoreDB;
  private default_registry: string;
  private backend: StateBackend<DatacenterRecord>;

  constructor(options: DatacenterStoreOptions) {
    this.cache_dir = options.cache_dir;
    this.default_registry = options.default_registry || 'registry-1.docker.io';
    this.backend = buildStateBackend('datacenters', options.backendConfig.type, options.backendConfig.credentials);
    this.find();

    try {
      this.db = JSON.parse(Deno.readTextFileSync(path.join(this.cache_dir, CACHE_DB_FILENAME)));
    } catch {
      this.db = {};
    }
  }

  public async find(): Promise<DatacenterRecord[]> {
    const rawRecords = await this.backend.getAll();
    return Promise.all(rawRecords.map(async (raw) => ({
      name: raw.name,
      config: await parseDatacenter(raw.config as any),
      priorState: new InfraGraph(raw.priorState),
    })));
  }

  public async get(name: string): Promise<DatacenterRecord | undefined> {
    const datacenters = await this.find();
    return datacenters.find((record) => record.name === name);
  }

  public async save(input: DatacenterRecord): Promise<void> {
    const allDatacenters = await this.find();
    const foundIndex = allDatacenters.findIndex((d) => d.name === input.name);
    if (foundIndex >= 0) {
      allDatacenters[foundIndex] = input;
    } else {
      allDatacenters.push(input);
    }
    this.backend.saveAll(allDatacenters);
  }

  public async remove(name: string): Promise<void> {
    const allDatacenters = await this.find();
    const foundIndex = allDatacenters.findIndex((d) => d.name === name);
    if (foundIndex < 0) {
      throw new Error(`The ${name} datacenter was not found`);
    }

    allDatacenters.splice(foundIndex, 1);
    await this.backend.saveAll(allDatacenters);
  }

  /**
   * Moves the datacenter and its corresponding files into the datacenter cache.
   *
   * @returns {string} - ID of the newly cached artifacts
   */
  async add(datacenter: Datacenter): Promise<string> {
    const datacenter_contents = JSON.stringify(datacenter);
    const artifact_id = (crypto
      .createHash('sha256')
      .update(datacenter_contents)
      .setEncoding('utf-8')
      .digest('hex') as string).substring(0, 12);
    const new_path = path.join(this.cache_dir, artifact_id);
    if (!pathExistsSync(new_path)) {
      Deno.mkdirSync(new_path, { recursive: true });
    }
    Deno.writeTextFileSync(path.join(new_path, 'datacenter.json'), datacenter_contents);
    return artifact_id;
  }

  /**
   * Retrieve a component configuration from the local cache
   *
   * @param {ImageRepository} repo - Image repository including metadata about the target component
   * @returns
   */
  async getCachedDatacenterDetails(repo: ImageRepository): Promise<{
    config_path: string;
    datacenter: Datacenter;
  }> {
    if (!this.db?.[repo.repository]?.[repo.toString()]) {
      throw new MissingDatacenterRef(repo.toString());
    }

    let config_path = this.db[repo.repository][repo.toString()];
    if (!config_path.startsWith('/')) {
      config_path = path.join(this.cache_dir, config_path);
    }

    return {
      config_path,
      datacenter: await parseDatacenter(config_path),
    };
  }

  /**
   * Get a component config by its cached ID or fully resolvable image ref. This will first check
   * the local cache before calling out to the registry. The cache will NOT be updated as a result
   * of calling this method.
   */
  async getDatacenter(ref_or_id: string): Promise<Datacenter> {
    // If the input is an image ID, look for it in the filesystem
    if (/^[\dA-Fa-f]{12}/.test(ref_or_id)) {
      const src_path = path.join(this.cache_dir, ref_or_id, 'datacenter.json');
      if (!pathExistsSync(src_path)) {
        throw new MissingDatacenterRef(ref_or_id);
      }

      return parseDatacenter(src_path);
    }

    const image = new ImageRepository<string>(ref_or_id, this.default_registry);

    try {
      const { datacenter } = await this.getCachedDatacenterDetails(image);
      return datacenter;
    } catch (ex) {
      const raw_config = await image.getConfig(MEDIA_TYPES.OCI_MANIFEST);
      return parseDatacenter(raw_config);
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
      const src_path = path.join(this.cache_dir, src_ref_or_id, 'datacenter.json');
      if (!pathExistsSync(src_path)) {
        throw new MissingDatacenterRef(src_ref_or_id);
      }

      this.db[dest_match.repository][dest_ref] = `./${src_ref_or_id}/datacenter.json`;
    } else {
      // If the src is an existing tag, create a new pointer in the DB
      const src_match = new ImageRepository(src_ref_or_id, this.default_registry);
      if (!this.db[src_match.repository] || !this.db[src_match.repository][src_ref_or_id]) {
        throw new MissingDatacenterRef(src_ref_or_id);
      }

      this.db[dest_match.repository][dest_ref] = this.db[src_match.repository][src_ref_or_id];
    }

    this.saveDb();
  }

  /**
   * Push the component from the local cache to the remote registry corresponding with the tag
   *
   * @param {string} ref_string - The component tag to push
   */
  async push(ref_string: string, tar_directory?: string): Promise<void> {
    const repository = new ImageRepository(ref_string, this.default_registry);
    await repository.checkForOciSupport();

    const { datacenter, config_path } = await this.getCachedDatacenterDetails(repository);

    // Upload the component config
    Deno.writeTextFileSync(config_path, JSON.stringify(datacenter));
    const config_blob = await repository.uploadBlob(config_path);

    // Upload the component directory contents
    if (!tar_directory) {
      tar_directory = Deno.makeTempDirSync();
    }
    const tar_filepath = path.join(tar_directory, 'files-layer.tgz');

    await tar.create({ gzip: true, file: tar_filepath, cwd: path.dirname(config_path) }, ['./']);
    console.log(`Uploading files layer: ${tar_filepath}`);
    const files_blob = await repository.uploadBlob(tar_filepath);

    // Create and upload the manifest
    const manifest: ImageManifest = {
      schemaVersion: 2,
      mediaType: MEDIA_TYPES.OCI_MANIFEST,
      config: {
        mediaType: 'application/vnd.architect.datacenter.config.v1+json',
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

  private saveDb() {
    Deno.writeTextFileSync(path.join(this.cache_dir, CACHE_DB_FILENAME), JSON.stringify(this.db));
  }
}
