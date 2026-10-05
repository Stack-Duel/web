const SHIFTS = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5,
  9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11,
  16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15,
  21,
];

const CONSTANTS = new Int32Array([
  0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a,
  0xa8304613, 0xfd469501, 0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
  0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821, 0xf61e2562, 0xc040b340,
  0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
  0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8,
  0x676f02d9, 0x8d2a4c8a, 0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
  0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70, 0x289b7ec6, 0xeaa127fa,
  0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
  0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92,
  0xffeff47d, 0x85845dd1, 0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
  0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
]);

const INT32_SCRATCH = new Int32Array(1);

function toInt32(value: number): number {
  INT32_SCRATCH[0] = value;
  return INT32_SCRATCH[0];
}

function rotateLeft(value: number, shift: number): number {
  return (value << shift) | (value >>> (32 - shift));
}

function toHexLittleEndian(value: number): string {
  const bytes = [
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff,
  ];
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function md5(input: string): string {
  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  const message = new TextEncoder().encode(input);
  const bitLength = message.length * 8;

  const padded = Array.from(message);
  padded.push(0x80);
  while (padded.length % 64 !== 56) padded.push(0);
  for (let i = 0; i < 4; i++) {
    padded.push((bitLength >>> (8 * i)) & 0xff);
  }
  for (let i = 0; i < 4; i++) {
    padded.push(0);
  }

  for (let offset = 0; offset < padded.length; offset += 64) {
    const chunk = padded.slice(offset, offset + 64);
    const words = new Int32Array(16);
    for (let j = 0; j < 16; j++) {
      words[j] =
        chunk[j * 4] |
        (chunk[j * 4 + 1] << 8) |
        (chunk[j * 4 + 2] << 16) |
        (chunk[j * 4 + 3] << 24);
    }

    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;

    for (let i = 0; i < 64; i++) {
      let f: number;
      let g: number;
      if (i < 16) {
        f = (b & c) | (~b & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * i) % 16;
      }
      f = toInt32(f + a + CONSTANTS[i] + words[g]);
      a = d;
      d = c;
      c = b;
      b = toInt32(b + rotateLeft(f, SHIFTS[i]));
    }

    a0 = toInt32(a0 + a);
    b0 = toInt32(b0 + b);
    c0 = toInt32(c0 + c);
    d0 = toInt32(d0 + d);
  }

  return (
    toHexLittleEndian(a0) +
    toHexLittleEndian(b0) +
    toHexLittleEndian(c0) +
    toHexLittleEndian(d0)
  );
}

export function getGravatarUrl(email: string, size = 200): string {
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=${size}`;
}
