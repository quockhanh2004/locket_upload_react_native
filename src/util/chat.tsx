/* eslint-disable no-bitwise */
export function generateUUIDv4() {
  function getRandomBytes(size: number) {
    const bytes = new Uint8Array(size);
    if (typeof global.crypto?.getRandomValues === 'function') {
      return global.crypto.getRandomValues(bytes);
    } else {
      // Fallback RN cũ: dùng Math.random()
      for (let i = 0; i < size; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
      return bytes;
    }
  }

  const bytes = getRandomBytes(16);

  // Force version 4 (UUID version 4)
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  // Force variant 10xx
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');

  return (
    hex.substring(0, 8) +
    '-' +
    hex.substring(8, 12) +
    '-' +
    hex.substring(12, 16) +
    '-' +
    hex.substring(16, 20) +
    '-' +
    hex.substring(20)
  );
}
