export function littleEndianToInteger(bytes: Uint8Array): bigint {
  let result = 0n;

  for (let i = bytes.length - 1; i >= 0; i--) {
    result = (result << 8n) | BigInt(bytes[i]);
  }

  return result;
}

export function integerToLittleEndian(value: number | bigint, length: number) {
  const bytes = new Uint8Array(length);

  if (typeof value === 'number') {
    value = BigInt(value);
  }

  let temp = value;
  let i = 0;
  while (temp > 0n && i < length) {
    bytes[i] = Number(temp & 0xffn);
    temp >>= 8n;
    i++;
  }

  return bytes;
}

export function readVarInt(bytes: Uint8Array) {
  const firstByte = bytes[0];

  // Oxfd means the next 2 bytes are a 16-bit integer
  if (firstByte === 0xfd) {
    return littleEndianToInteger(bytes.slice(1, 3));
  } else if (firstByte === 0xfe) {
    return littleEndianToInteger(bytes.slice(1, 5));
  } else if (firstByte === 0xff) {
    return littleEndianToInteger(bytes.slice(1, 9));
  } else {
    return firstByte;
  }
}

export function encodeVarInt(value: number | bigint) {
  value = BigInt(value);

  if (value < 0xfdn) {
    return new Uint8Array([Number(value)]);
  }
  // 2^16
  else if (value < 0x10000n) {
    return new Uint8Array([0xfd, ...integerToLittleEndian(value, 2)]);
  }
  // 2^32
  else if (value < 0x100000000n) {
    return new Uint8Array([0xfe, ...integerToLittleEndian(value, 4)]);
  }
  // 2^64 is max value
  else if (value < 0x10000000000000000n) {
    return new Uint8Array([0xff, ...integerToLittleEndian(value, 8)]);
  } else {
    throw new Error('Value too large to encode as a varint.');
  }
}

export function hexToBytes(hex: string) {
  hex = hex.replace('0x', '');

  if (hex.length % 2 !== 0) {
    hex = '0' + hex;
  }

  const bytes = new Uint8Array(hex.length / 2);

  if (hex.length % 2 !== 0) {
    hex = '0' + hex;
  }

  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.slice(i, i + 2), 16);
    if (isNaN(Number(byte))) {
      throw new Error('Invalid hex string');
    }

    bytes[i / 2] = byte;
  }

  return bytes;
}

export function bytesToHex(bytes: Uint8Array, include0x = false) {
  let prefix = include0x ? '0x' : '';
  return prefix + Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}
