import { Component } from '../../components/index.ts';
import { parseComponent } from '../../components/parser.ts';
import { ComponentStore } from '../store.ts';
import { ImageManifest, ImageRepository } from '@architect-io/arc-oci';
import jest from 'jest-mock';
import mock_fs from 'mock-fs';
import os from 'os';
import * as path from 'std/path/mod.ts';
import tar from 'tar';

const DEFAULT_REGISTRY = 'registry.architect.io';

describe('ComponentStore', () => {
  afterEach(() => {
    mock_fs.restore();
  });

  test('it should add components to the local store', async () => {
    const tmp_dir = os.tmpdir();
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

    mock_fs({
      '/component': {
        'architect.yml': component_config,
      },
    });

    const component_id = await store.add('/component/architect.yml');
    expect(component_id.length).toEqual(64);

    // Make sure what got stored is the same as what we put in
    const original_config = await parseComponent('/component/architect.yml');
    const stored_config = await store.getComponentConfig(component_id);
    expect(stored_config).toEqual(original_config);
  });

  test('it should create tags for stored components', async () => {
    const tmp_dir = os.tmpdir();
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

    mock_fs({
      '/component': {
        'architect.yml': component_config,
      },
    });

    const component_id = await store.add('/component/architect.yml');
    store.tag(component_id, 'new/component:latest');

    const original_config = await parseComponent('/component/architect.yml');
    const stored_config = await store.getComponentConfig(
      'new/component:latest',
    );
    expect(stored_config).toEqual(original_config);
  });

  test('it should remove stored components', async () => {
    const tmp_dir = os.tmpdir();
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

    mock_fs({
      '/component': {
        'architect.yml': component_config,
      },
    });

    const component_id = await store.add('/component/architect.yml');
    await store.getComponentConfig(component_id);
    await store.remove(component_id);
    try {
      await store.getComponentConfig(component_id);
      fail(`Should have failed to retrieve missing component: ${component_id}`);
    } catch {}
  });

  test('it should remove stored components by tag', async () => {
    const tmp_dir = os.tmpdir();
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

    mock_fs({
      '/component': {
        'architect.yml': component_config,
      },
    });

    const component_id = await store.add('/component/architect.yml');
    await store.getComponentConfig(component_id);

    const tag = 'namespace/component:latest';
    store.tag(component_id, tag);
    await store.remove(tag);
    try {
      await store.getComponentConfig(tag);
      fail(`Should have failed to retrieve missing component: ${tag}`);
    } catch {}
  });

  test('it should push stored components to remote registries', async () => {
    const tmp_dir = path.join(os.tmpdir(), 'component-store');
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

    mock_fs({
      '/component': {
        'architect.yml': component_config,
      },
    });

    const tag = 'localhost:5000/namespace/component:latest';
    const component_id = await store.add('/component/architect.yml');
    store.tag(component_id, tag);

    const repo = new ImageRepository(tag, DEFAULT_REGISTRY);
    const details = await store.getCachedComponentDetails(repo);

    // Mock the `ImageRepository.uploadBlob()` method
    const mockUploadBlob = jest.fn((file: string) => {
      switch (file) {
        case details.config_path: {
          return Promise.resolve({
            digest:
              'sha256:bb3eb5374dc00e5f8850460d216afc78ea6741013bc996baa75cb7f176a5b7a6',
            size: 127,
          });
        }
        case path.join(os.tmpdir(), 'files-layer.tgz'): {
          return Promise.resolve({
            digest:
              'sha256:7df640a8589662e0107b068811c9333b86484a908250a742a91fb1cdd5e2aecd',
            size: 300,
          });
        }
        default: {
          throw new Error('Invalid blob path');
        }
      }
    });
    jest
      .spyOn(ImageRepository.prototype, 'uploadBlob')
      .mockImplementation(mockUploadBlob);

    // Mock the `ImageRepository.checkForOciSupport()` method
    const mockCheckForOciSupport = jest.fn(() => Promise.resolve());
    jest
      .spyOn(ImageRepository.prototype, 'checkForOciSupport')
      .mockImplementation(mockCheckForOciSupport);

    // Mock the `ImageRepository.uploadManifest()` method
    const mockUploadManifest = jest.fn((manifest: ImageManifest) =>
      Promise.resolve(),
    );
    jest
      .spyOn(ImageRepository.prototype, 'uploadManifest')
      .mockImplementation(mockUploadManifest);

    await store.push('localhost:5000/namespace/component:latest');

    expect(mockCheckForOciSupport).toHaveBeenCalledTimes(1);
    expect(mockUploadBlob).toHaveBeenCalledTimes(2);
    expect(mockUploadBlob.mock.calls[0][0]).toEqual(
      path.join(
        tmp_dir,
        'f24572215a3fbb037dcf66fd4c923dbfb8e8672d7f5673cde24d337fffcbbf6f',
        'architect.json',
      ),
    );
    expect(mockUploadBlob.mock.calls[1][0]).toEqual(
      path.join(os.tmpdir(), 'files-layer.tgz'),
    );
    expect(mockUploadManifest).toHaveBeenCalledTimes(1);
    expect(mockUploadManifest.mock.calls[0][0]).toEqual({
      config: {
        digest:
          'sha256:bb3eb5374dc00e5f8850460d216afc78ea6741013bc996baa75cb7f176a5b7a6',
        mediaType: 'application/vnd.architect.component.config.v1+json',
        size: 127,
      },
      layers: [
        {
          digest:
            'sha256:7df640a8589662e0107b068811c9333b86484a908250a742a91fb1cdd5e2aecd',
          mediaType: 'application/vnd.oci.image.layer.v1.tar+gzip',
          size: 300,
        },
      ],
      mediaType: 'application/vnd.oci.image.manifest.v1+json',
      schemaVersion: 2,
    });
  });

  test('it should pull stored components from remote registries', async () => {
    const tmp_dir = path.join(os.tmpdir(), 'component-store');
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
          command: echo "test"
    `;

    mock_fs({
      '/component': {
        'architect.yml': component_config,
      },
    });

    const tar_file = path.join(os.tmpdir(), 'files-layer.tgz');
    await tar.create({ gzip: true, file: tar_file, cwd: '/component' }, ['./']);

    const mockGetManifest = jest.fn(() =>
      Promise.resolve({
        config: {
          digest:
            'sha256:bb3eb5374dc00e5f8850460d216afc78ea6741013bc996baa75cb7f176a5b7a6',
          mediaType: 'application/vnd.architect.component.config.v1+json',
          size: 127,
        },
        layers: [
          {
            digest:
              'sha256:7df640a8589662e0107b068811c9333b86484a908250a742a91fb1cdd5e2aecd',
            mediaType: 'application/vnd.oci.image.layer.v1.tar+gzip',
            size: 300,
          },
        ],
        mediaType: 'application/vnd.oci.image.manifest.v1+json',
        schemaVersion: 2,
      }),
    );
    jest
      .spyOn(ImageRepository.prototype, 'getManifest')
      .mockImplementation(mockGetManifest);

    const mockDownloadBlob = jest.fn(() => Promise.resolve(tar_file));
    jest
      .spyOn(ImageRepository.prototype, 'downloadBlob')
      .mockImplementation(mockDownloadBlob);

    const mockStoreAdd = jest.fn((_: string | Component) =>
      Promise.resolve(''),
    );
    jest.spyOn(store, 'add').mockImplementation(mockStoreAdd);

    await store.pull('localhost:5000/namespace/component:latest');

    expect(mockGetManifest).toBeCalledTimes(1);
    expect(mockDownloadBlob).toBeCalledTimes(1);
    expect(mockStoreAdd).toBeCalledTimes(1);
    expect(mockStoreAdd.mock.calls[0][0]).toEqual(
      path.join(
        tmp_dir,
        'bb3eb5374dc00e5f8850460d216afc78ea6741013bc996baa75cb7f176a5b7a6',
        'architect.json',
      ),
    );
  });
});
