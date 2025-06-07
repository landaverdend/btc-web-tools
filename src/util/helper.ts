export function littleEndianToInteger(bytes: Uint8Array): bigint {
  let result = 0n;

  for (let i = bytes.length - 1; i >= 0; i--) {
    result = (result << 8n) | BigInt(bytes[i]);
  }

  return result;
}

export function integerToLittleEndian(value: bigint, length: number) {
  const bytes = new Uint8Array(length);

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

export function encodeVarInt(value: number) {
  if (value < 0xfd) {
    return new Uint8Array([value]);
  }
  // 2^16
  else if (value < 0x10000) {
    return new Uint8Array([0xfd, ...integerToLittleEndian(BigInt(value), 2)]);
  }
  // 2^32
  else if (value < 0x100000000) {
    return new Uint8Array([0xfe, ...integerToLittleEndian(BigInt(value), 4)]);
  }
  // 2^64 is max value
  else if (value < 0x10000000000000000) {
    return new Uint8Array([0xff, ...integerToLittleEndian(BigInt(value), 8)]);
  } else {
    throw new Error('Value too large to encode as a varint.');
  }
}
