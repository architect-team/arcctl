import * as mockFile from 'https://deno.land/x/mock_file@v1.1.2/mod.ts';
import * as path from 'std/path/mod.ts';
import { assertEquals, assertRejects } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';
import { assertSpyCall, assertSpyCalls, stub } from 'std/testing/mock.ts';
import tar from 'tar';
import { Component } from '../../components/index.ts';
import { parseComponent } from '../../components/parser.ts';
import { ImageManifest, ImageRepository } from '../../oci/index.ts';
import { ComponentStore } from '../store.ts';

const DEFAULT_REGISTRY = 'registry.architect.io';

describe(
  'ComponentStore',
  {
    sanitizeResources: false,
    sanitizeOps: false,
  },
  () => {
    it('should add components to the local store', async () => {
      const tmp_dir = Deno.makeTempDirSync();

      const store = new ComponentStore(tmp_dir, DEFAULT_REGISTRY);

      const component_config = `
      name: test/this
      description: Some description
      keywords:
        - test
        - this
      services:
        db:
          image: postgres:13
        api:
          image: node:12
    `;

      mockFile.prepareVirtualFile('/component/architect.yml', new TextEncoder().encode(component_config));

      const component_id = await store.add('/component/architect.yml');
      assertEquals(component_id.length, 12);

      // Make sure what got stored is the same as what we put in
      const original_config = await parseComponent('/component/architect.yml');
      const stored_config = await store.getComponentConfig(component_id);
      assertEquals(stored_config, original_config);
    });

    it('should create tags for stored components', async () => {
      const tmp_dir = Deno.makeTempDirSync();
      const store = new ComponentStore(tmp_dir, DEFAULT_REGISTRY);

      const component_config = `
      name: test/this
      description: Some description
      keywords:
        - test
        - this
      services:
        db:
          image: postgres:13
        api:
          image: postgres:12
    `;

      mockFile.prepareVirtualFile('/component/architect.yml', new TextEncoder().encode(component_config));

      const component_id = await store.add('/component/architect.yml');
      store.tag(component_id, 'new/component:latest');

      const original_config = await parseComponent('/component/architect.yml');
      const stored_config = await store.getComponentConfig('new/component:latest');
      assertEquals(stored_config, original_config);
    });

    it('should remove stored components', async () => {
      const tmp_dir = Deno.makeTempDirSync();
      const store = new ComponentStore(tmp_dir, DEFAULT_REGISTRY);

      const component_config = `
      name: test/this
      description: Some description
      keywords:
        - test
        - this
      services:
        db:
          image: postgres:13
        api:
          image: node:12
    `;

      mockFile.prepareVirtualFile('/component/architect.yml', new TextEncoder().encode(component_config));

      const component_id = await store.add('/component/architect.yml');
      await store.getComponentConfig(component_id);
      await store.remove(component_id);

      assertRejects(async () => {
        await store.getComponentConfig(component_id);
      });
    });

    it('should remove stored components by tag', async () => {
      const tmp_dir = Deno.makeTempDirSync();
      const store = new ComponentStore(tmp_dir, DEFAULT_REGISTRY);

      const component_config = `
        name: test/this
        description: Some description
        keywords:
          - test
          - this
        services:
          db:
            image: postgres:13
          api:
            image: node:12
      `;

      mockFile.prepareVirtualFile('/component/architect.yml', new TextEncoder().encode(component_config));

      const component_id = await store.add('/component/architect.yml');
      await store.getComponentConfig(component_id);

      const tag = 'namespace/component:latest';
      store.tag(component_id, tag);
      await store.remove(tag);

      assertRejects(async () => {
        await store.getComponentConfig(tag);
      });
    });

    it('should push stored components to remote registries', async () => {
      const tmp_dir = Deno.makeTempDirSync();
      const tmp_store = path.join(tmp_dir, 'component-store');
      const store = new ComponentStore(tmp_store, DEFAULT_REGISTRY);

      const component_config = `
      name: test/this
      description: Some description
      keywords:
        - test
        - this
      services:
        db:
          image: postgres:13
        api:
          image: node:12
    `;

      mockFile.prepareVirtualFile('/component/architect.yml', new TextEncoder().encode(component_config));

      const tag = 'localhost:5000/namespace/component:latest';
      const component_id = await store.add('/component/architect.yml');
      store.tag(component_id, tag);

      const repo = new ImageRepository(tag, DEFAULT_REGISTRY);
      const details = await store.getCachedComponentDetails(repo);

      // Mock the `ImageRepository.uploadBlob()` method
      const mockUploadBlob = (file: string) => {
        switch (file) {
          case details.config_path: {
            return Promise.resolve({
              digest: 'sha256:bb3eb5374dc00e5f8850460d216afc78ea6741013bc996baa75cb7f176a5b7a6',
              size: 127,
            });
          }
          case path.join(tmp_dir, 'files-layer.tgz'): {
            return Promise.resolve({
              digest: 'sha256:7df640a8589662e0107b068811c9333b86484a908250a742a91fb1cdd5e2aecd',
              size: 300,
            });
          }
          default: {
            throw new Error(`Invalid blob path: ${file} ${tmp_dir}`);
          }
        }
      };

      const mockUpload = stub(ImageRepository.prototype, 'uploadBlob', mockUploadBlob);

      // Mock the `ImageRepository.checkForOciSupport()` method
      const mockCheckForOciSupport = () => Promise.resolve();
      const mockCheckForOciStub = stub(ImageRepository.prototype, 'checkForOciSupport', mockCheckForOciSupport);

      // Mock the `tar.create()` method
      const mockTarCreateFn = (options: tar.CreateOptions & tar.FileOptions, fileList: readonly string[]) =>
        Promise.resolve();
      const mockTarCreate = stub(tar, 'create', mockTarCreateFn);

      // Mock the `ImageRepository.uploadManifest()` method
      const mockUploadManifestFn = (_manifest: ImageManifest) => Promise.resolve();
      const mockUploadManifest = stub(ImageRepository.prototype, 'uploadManifest', mockUploadManifestFn);

      await store.push('localhost:5000/namespace/component:latest', tmp_dir);

      mockCheckForOciStub.restore();
      mockTarCreate.restore();
      mockUpload.restore();
      mockUploadManifest.restore();

      assertSpyCalls(mockCheckForOciStub, 1);
      assertSpyCalls(mockTarCreate, 1);
      assertSpyCalls(mockUpload, 2);
      assertSpyCall(mockUpload, 0, {
        args: [
          path.join(tmp_store, 'f24572215a3f', 'architect.json'),
        ],
      });
      assertSpyCall(mockUpload, 1, {
        args: [path.join(tmp_dir, 'files-layer.tgz')],
      });

      assertSpyCalls(mockUploadManifest, 1);
      assertSpyCall(mockUploadManifest, 0, {
        args: [
          {
            config: {
              digest: 'sha256:bb3eb5374dc00e5f8850460d216afc78ea6741013bc996baa75cb7f176a5b7a6',
              mediaType: 'application/vnd.architect.component.config.v1+json',
              size: 127,
            },
            layers: [
              {
                digest: 'sha256:7df640a8589662e0107b068811c9333b86484a908250a742a91fb1cdd5e2aecd',
                mediaType: 'application/vnd.oci.image.layer.v1.tar+gzip',
                size: 300,
              },
            ],
            mediaType: 'application/vnd.oci.image.manifest.v1+json',
            schemaVersion: 2,
          },
        ],
      });
    });

    it('should pull stored components from remote registries', async () => {
      const tmp_dir = Deno.makeTempDirSync();
      const tmp_store = path.join(tmp_dir, 'component-store');
      const store = new ComponentStore(tmp_store, DEFAULT_REGISTRY);

      const component_config = `
        name: test/this
        description: Some description
        keywords:
          - test
          - this
        services:
          db:
            image: postgres:13
          api:
            image: node:12
            command: echo "test"
      `;

      mockFile.prepareVirtualFile('/component/architect.yml', new TextEncoder().encode(component_config));

      console.log('Creating tar');

      const tar_file = path.join(tmp_dir, 'files-layer.tgz');
      await tar.create({ gzip: true, file: tar_file, cwd: tmp_dir }, ['./']);

      console.log('Tar created');

      const mockGetManifestFn = () => {
        return Promise.resolve({
          config: {
            digest: 'sha256:bb3eb5374dc00e5f8850460d216afc78ea6741013bc996baa75cb7f176a5b7a6',
            mediaType: 'application/vnd.architect.component.config.v1+json',
            size: 127,
          },
          layers: [
            {
              digest: 'sha256:7df640a8589662e0107b068811c9333b86484a908250a742a91fb1cdd5e2aecd',
              mediaType: 'application/vnd.oci.image.layer.v1.tar+gzip',
              size: 300,
            },
          ],
          mediaType: 'application/vnd.oci.image.manifest.v1+json',
          schemaVersion: 2,
        });
      };

      const mockGetManifest = stub(ImageRepository.prototype, 'getManifest', mockGetManifestFn);

      const mockDownloadBlobFn = () => Promise.resolve(tar_file);
      const mockDownloadBlob = stub(ImageRepository.prototype, 'downloadBlob', mockDownloadBlobFn);

      const mockStoreAddFn = (_: string | Component) => Promise.resolve('');
      const mockStoreAdd = stub(store, 'add', mockStoreAddFn);

      await store.pull('localhost:5000/namespace/component:latest');

      assertSpyCalls(mockGetManifest, 1);
      assertSpyCalls(mockDownloadBlob, 1);
      assertSpyCalls(mockStoreAdd, 1);

      assertSpyCall(mockStoreAdd, 0, {
        args: [
          path.join(tmp_store, 'bb3eb5374dc00e5f8850460d216afc78ea6741013bc996baa75cb7f176a5b7a6', 'architect.json'),
        ],
      });
    });
  },
);
