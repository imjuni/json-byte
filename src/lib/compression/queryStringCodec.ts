const toUrlSafeBase64 = (values: Uint8Array): string => {
  const characters: string[] = [];

  for (const value of values) characters.push(String.fromCharCode(value));

  return btoa(characters.join('')).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
};

const fromUrlSafeBase64 = (value: string): Uint8Array => {
  const standardBase64 = value.replaceAll('-', '+').replaceAll('_', '/');
  const paddedBase64 = standardBase64 + '=='.slice(0, (4 - (standardBase64.length % 4)) % 4);
  const binary = atob(paddedBase64);

  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
};

export const compressQueryString = async (value: string): Promise<string | Error> => {
  try {
    const source = new Blob([value]).stream();
    const compressed = source.pipeThrough(new CompressionStream('deflate'));
    const bytes = new Uint8Array(await new Response(compressed).arrayBuffer());

    return toUrlSafeBase64(bytes);
  } catch (caught) {
    return new Error(`Failed to compress querystring: ${caught instanceof Error ? caught.message : String(caught)}`);
  }
};

export const decompressQueryString = async (value: string): Promise<string | Error> => {
  try {
    const bytes = fromUrlSafeBase64(value);
    const source = new Blob([Uint8Array.from(bytes).buffer]).stream();
    const decompressed = source.pipeThrough(new DecompressionStream('deflate'));

    return await new Response(decompressed).text();
  } catch (caught) {
    return new Error(`Failed to decompress querystring: ${caught instanceof Error ? caught.message : String(caught)}`);
  }
};
