import * as mockFile from 'https://deno.land/x/mock_file@v1.1.2/mod.ts';
import * as path from 'std/path/mod.ts';
import { assertArrayIncludes, assertEquals } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';
import { buildStateBackend } from '../builder.ts';

const genericBackend = buildStateBackend('test', 'local', {});

describe('StateBackend', () => {
  it('should should replace file references with hashes in object', () => {
    const files = {
      '/tmp/test.txt': 'test',
      '/tmp/test2.txt': 'test2',
      'test3.txt': 'test3',
      'test4.txt': 'test4',
    };
    for (const [key, value] of Object.entries(files)) {
      mockFile.prepareVirtualFile(key, new TextEncoder().encode(value));
    }
    const testObj = {
      a: 'test',
      b: 'test2',
      subObj: {
        d: 'test3',
        e: 'test4',
        f: 4,
        g: 4.4,
        file: '/tmp/test.txt',
      },
      fileArray: [
        '/tmp/test2.txt',
        'test3.txt',
      ],
      file: 'test4.txt',
      testUndefined: undefined,
    };
    const fileHashes = genericBackend['replaceFileReferencesWithHashes'](testObj);
    assertEquals(Object.values(fileHashes).length, 4);
    assertArrayIncludes(Object.values(fileHashes), Object.values(files));
  });

  it('should replace file references with hashes in array', () => {
    const files = {
      '/tmp/test.txt': 'test',
      '/tmp/test2.txt': 'test2',
      'test3.txt': 'test3',
      'test4.txt': 'test4',
    };
    for (const [key, value] of Object.entries(files)) {
      mockFile.prepareVirtualFile(key, new TextEncoder().encode(value));
    }
    const testArray = [
      'test',
      'test2',
      {
        d: 'test3',
        e: 'test4',
        f: 4,
        g: 4.4,
        file: '/tmp/test.txt',
      },
      [
        '/tmp/test2.txt',
        'test3.txt',
      ],
      'test4.txt',
      undefined,
    ];
    const fileHashes = genericBackend['replaceFileReferencesWithHashes'](testArray);
    assertEquals(Object.values(fileHashes).length, 4);
    assertArrayIncludes(Object.values(fileHashes), Object.values(files));
  });

  it('file reference replace should handle undefined', () => {
    genericBackend['replaceFileReferencesWithHashes'](undefined);
  });

  it('should replace hashes with file references in object', () => {
    const directory = '/tmp';
    const fileHashes = {
      'aaaaaaaaaaa': 'test1',
      'bbbbbbbbbbb': 'test2',
      'ccccccccccc': 'test3',
    };
    const testObj = {
      file1: 'aaaaaaaaaaa',
      subObj: {
        file2: 'bbbbbbbbbbb',
      },
      fileArray: [
        'ccccccccccc',
      ],
    };

    for (const key of Object.keys(fileHashes)) {
      mockFile.prepareVirtualFile(path.join(directory, key));
    }

    genericBackend['replaceHashesWithFileReferences'](directory, testObj, fileHashes);

    for (const [key, value] of Object.entries(fileHashes)) {
      const contents = Deno.readTextFileSync(path.join(directory, key));
      assertEquals(value, contents);
    }
    assertEquals(testObj.file1, path.join(directory, 'aaaaaaaaaaa'));
    assertEquals(testObj.subObj.file2, path.join(directory, 'bbbbbbbbbbb'));
    assertEquals(testObj.fileArray[0], path.join(directory, 'ccccccccccc'));
  });

  it('should replace hashes with file references in array', () => {
    const directory = '/tmp';
    const fileHashes = {
      'aaaaaaaaaaa': 'test1',
      'bbbbbbbbbbb': 'test2',
      'ccccccccccc': 'test3',
    };
    const testArray = [
      'aaaaaaaaaaa',
      {
        file2: 'bbbbbbbbbbb',
      },
      [
        'ccccccccccc',
      ],
    ];

    for (const key of Object.keys(fileHashes)) {
      mockFile.prepareVirtualFile(path.join(directory, key));
    }

    genericBackend['replaceHashesWithFileReferences'](directory, testArray, fileHashes);

    for (const [key, value] of Object.entries(fileHashes)) {
      const contents = Deno.readTextFileSync(path.join(directory, key));
      assertEquals(value, contents);
    }

    assertEquals(testArray[0], path.join(directory, 'aaaaaaaaaaa'));
    assertEquals((testArray[1] as any).file2, path.join(directory, 'bbbbbbbbbbb'));
    assertEquals((testArray[2] as any)[0], path.join(directory, 'ccccccccccc'));
  });

  it('handle undefined when replacing hashes with files', () => {
    genericBackend['replaceHashesWithFileReferences']('', undefined, {});
  });
});
