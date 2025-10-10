export function toBase64(value: Uint8Array): string {
  const binaryString = String.fromCharCode(...value);
  const base64String = btoa(binaryString);
  return base64String;
}
