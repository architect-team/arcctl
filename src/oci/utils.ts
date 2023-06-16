import { createHash } from 'https://deno.land/std@0.80.0/hash/mod.ts';
import * as iter from 'https://deno.land/x/iter/mod.ts';

interface BinaryData {
  digest: string;
  size: number;
  data: string;
}

export const fileToBinaryData = async (file: string): Promise<BinaryData> => {
  const hash = createHash('sha256');
  const file_contents = await Deno.open(
    new URL(file, import.meta.url),
  );
  for await (const chunk of iter(file_contents)) {
    hash.update(chunk);
  }

  const data = await Deno.readFile(file);
  return {
    digest: 'sha256:' + createHash('sha256').update(data.buffer).toString('hex'),
    size: data.byteLength,
    data: (new TextDecoder()).decode(data),
  };
};

export const IMAGE_REGEXP =
  /^(?:((?:[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)+|localhost)(?::[0-9]{1,5})?)\/)?([a-zA-Z0-9]+(?:\/[a-zA-Z0-9]+)*)(:[a-zA-Z0-9][a-zA-Z0-9_.-]*|@[a-zA-Z0-9]+:[a-fA-F0-9]+)?$/;
