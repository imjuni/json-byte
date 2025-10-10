export function toBase64(values: Uint8Array): string {
  const arr = [];

  for (const value of values) {
    const binaryChar = String.fromCharCode(value);
    arr.push(binaryChar);
  }

  const base64String = btoa(arr.join(''));
  return base64String;
}
