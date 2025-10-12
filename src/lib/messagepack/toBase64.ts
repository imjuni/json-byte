export function toBase64(values: Uint8Array): string {
  const arr = [];

  for (const value of values) {
    const binaryChar = String.fromCharCode(value);
    arr.push(binaryChar);
  }

  const base64String = btoa(arr.join(''));

  // Convert standard base64 to URL-safe base64
  // Replace standard characters with URL-safe characters and remove padding
  const urlSafeBase64 = base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return urlSafeBase64;
}
