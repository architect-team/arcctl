import * as crypto from 'https://deno.land/std@0.177.0/node/crypto.ts';

interface BinaryData {
  digest: string;
  size: number;
  data: string;
}

export const fileToBinaryData = async (file: string): Promise<BinaryData> => {
  const file_contents = await Deno.readFile(file);
  const data = (new TextDecoder()).decode(file_contents);
  return {
    digest: 'sha256:' + crypto.createHash('sha256').update(data).digest('hex').toString(),
    size: file_contents.byteLength,
    data,
  };
};

export const IMAGE_REGEXP =
  /^(?:((?:[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)+|localhost)(?::[0-9]{1,5})?)\/)?([a-zA-Z0-9]+(?:\/[a-zA-Z0-9_-]+)*)(:[a-zA-Z0-9][a-zA-Z0-9_.-]*|@[a-zA-Z0-9]+:[a-fA-F0-9]+)?$/;
