export function fromBase64(value: string): Uint8Array | Error {
  try {
    // URL-safe base64 to standard base64 conversion
    // Replace URL-safe characters with standard base64 characters
    const standardBase64 = value.replace(/-/g, '+').replace(/_/g, '/');

    // Add padding if needed
    const paddedBase64 = standardBase64 + '=='.slice(0, (4 - (standardBase64.length % 4)) % 4);

    const binaryString = atob(paddedBase64);
    const bytes = new Uint8Array(binaryString.length);

    // eslint-disable-next-line no-restricted-syntax
    for (let i = 0; i < binaryString.length; i += 1) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes;
  } catch (caught) {
    return new Error(`Failed to decode base64: ${caught instanceof Error ? caught.message : String(caught)}`);
  }
}
