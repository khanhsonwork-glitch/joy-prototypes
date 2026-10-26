// Width/height of a PNG, JPEG or WebP file without native tools (replaces macOS-only sips).
import fs from 'node:fs/promises';

export async function imageSize(file) {
  const b = await fs.readFile(file);
  if (b.readUInt32BE(0) === 0x89504e47) return {width: b.readUInt32BE(16), height: b.readUInt32BE(20)};
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = b.toString('ascii', 12, 16);
    if (chunk === 'VP8X') return {width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3)};
    if (chunk === 'VP8L') {const bits = b.readUInt32LE(21); return {width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1};}
    return {width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff};
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) {i++; continue;}
      const marker = b[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return {width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5)};
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  throw Error(`Không đọc được kích thước ảnh: ${file}`);
}
