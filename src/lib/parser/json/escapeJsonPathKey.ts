export function escapeJsonPathKey(key: string): string {
  // 항상 bracket-notation로 안전하게 생성
  return `['${key.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}']`;
}
