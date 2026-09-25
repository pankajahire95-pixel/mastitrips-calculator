import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height) {
  // RGBA buffer: each row has 1 filter byte (0) + width * 4 bytes
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.44;
  const innerRadius = width * 0.38;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Rounded rectangle / squircle background: slate-900 with subtle gradient
      const isInsideCard = Math.abs(dx) < width * 0.44 && Math.abs(dy) < height * 0.44;
      // Circular badge inside
      if (dist < radius) {
        // Gradient from Indigo-600 (37, 99, 235) to Slate-900 (15, 23, 42)
        const t = (x + y) / (width + height);
        const r = Math.round(30 + t * 40);
        const g = Math.round(58 + t * 50);
        const b = Math.round(138 + t * 110);
        
        // Let's draw an 'M' letter in center
        // Normalize coordinates inside [-1, 1]
        const nx = (x - cx) / (width * 0.28);
        const ny = (y - cy) / (height * 0.28);

        let isLetter = false;
        if (ny >= -0.7 && ny <= 0.7) {
          // Left stem
          if (nx >= -0.8 && nx <= -0.5) isLetter = true;
          // Right stem
          if (nx >= 0.5 && nx <= 0.8) isLetter = true;
          // Left diag
          if (nx >= -0.5 && nx <= 0 && Math.abs(ny - (nx * 1.4 + 0.1)) < 0.22) isLetter = true;
          // Right diag
          if (nx >= 0 && nx <= 0.5 && Math.abs(ny - (-nx * 1.4 + 0.1)) < 0.22) isLetter = true;
        }

        if (isLetter) {
          // Orange 500 / Amber 400
          rawData[pixelOffset] = 249;     // R
          rawData[pixelOffset + 1] = 115; // G
          rawData[pixelOffset + 2] = 22;  // B
          rawData[pixelOffset + 3] = 255; // A
        } else {
          rawData[pixelOffset] = r;
          rawData[pixelOffset + 1] = g;
          rawData[pixelOffset + 2] = b;
          rawData[pixelOffset + 3] = 255;
        }
      } else {
        // Transparent outer
        rawData[pixelOffset] = 0;
        rawData[pixelOffset + 1] = 0;
        rawData[pixelOffset + 2] = 0;
        rawData[pixelOffset + 3] = 0;
      }
    }
  }

  // PNG chunks
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // Color type RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT (Deflated)
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeInt32BE(crc, 8 + len);
  return chunk;
}

// CRC32 implementation
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) | 0;
}

fs.writeFileSync('public/icon-192.png', createPNG(192, 192));
fs.writeFileSync('public/icon-512.png', createPNG(512, 512));
console.log('PNG icons created successfully!');
