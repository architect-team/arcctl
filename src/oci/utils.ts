import { createHash } from 'https://deno.land/std@0.80.0/hash/mod.ts';

interface BinaryData {
  digest: string;
  size: number;
  data: string;
}

export const fileToBinaryData = async (file: string): Promise<BinaryData> => {
  const file_contents = await Deno.readFile(file);
  return {
    digest: 'sha256:' + createHash('sha256').update(file_contents.buffer).toString('hex'),
    size: file_contents.byteLength,
    data: (new TextDecoder()).decode(file_contents),
  };
};

export const IMAGE_REGEXP =
  /^(?:((?:[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)+|localhost)(?::[0-9]{1,5})?)\/)?([a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*)(:[a-zA-Z0-9][a-zA-Z0-9_.-]*|@[a-zA-Z0-9_-]+:[a-fA-F0-9]+)?$/;
