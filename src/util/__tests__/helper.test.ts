import { littleEndianToInteger, integerToLittleEndian, readVarInt, encodeVarInt } from '../helper';

describe('littleEndianToInteger', () => {
  test('correct conversion', () => {
    const bytes = new Uint8Array([0x99, 0xc3, 0x98, 0x00, 0x00, 0x00, 0x00, 0x00]);
    const want = BigInt(10011545);
    const got = littleEndianToInteger(bytes);
    expect(got).toBe(want);
  });

  test('correct conversion #2', () => {
    const bytes = new Uint8Array([0xa1, 0x35, 0xef, 0x01, 0x00, 0x00, 0x00, 0x00]);
    const want = BigInt(32454049);
    const got = littleEndianToInteger(bytes);
    expect(got).toBe(want);
  });
});

describe('integerToLittleEndian', () => {
  test('correct conversion', () => {
    const n = 1;
    const want = new Uint8Array([0x01, 0x00, 0x00, 0x00]);
    const got = integerToLittleEndian(BigInt(n), 4);

    expect(got).toEqual(want);
  });

  test('correct conversion 2', () => {
    const n = 10011545;

    const want = new Uint8Array([0x99, 0xc3, 0x98, 0x00, 0x00, 0x00, 0x00, 0x00]);
    const got = integerToLittleEndian(BigInt(n), 8);

    expect(got).toEqual(want);
  });
});

describe('readVarInt', () => {
  test('correct conversion for small value', () => {
    const bytes = new Uint8Array([0x01]);

    const want = 1;
    const got = readVarInt(bytes);

    expect(got).toEqual(want);
  });

  test('correct conversion for medium value', () => {
    const bytes = new Uint8Array([0xfd, 0xf4, 0x01]); // little endian 0x01f4

    const want = 0x01f4n;
    const got = readVarInt(bytes);

    expect(got).toEqual(want);
  });

  test('correct conversion for large value', () => {
    const bytes = new Uint8Array([0xfe, 0xa0, 0x86, 0x01, 0x00]);

    const want = 0x0186a0n;
    const got = readVarInt(bytes);

    expect(got).toEqual(want);
  });

  test('correct conversion for very large value', () => {
    const bytes = new Uint8Array([0xff, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);

    // const want = 0x010000000000000000n;
    const want = 1n;
    const got = readVarInt(bytes);
    expect(got).toEqual(want);
  });
});

describe('encodeVarInt', () => {
  test('correct conversion for small value', () => {
    const want = new Uint8Array([0x01]);
    const got = encodeVarInt(1n);

    expect(got).toEqual(want);
  });

  test('correct conversion for medium value', () => {
    const want = new Uint8Array([0xfd, 0xf4, 0x01]); // little endian 0x01f4

    const val = 0x01f4n;
    const got = encodeVarInt(val);

    expect(got).toEqual(want);
  });

  test('correct conversion for large value', () => {
    const want = new Uint8Array([0xfe, 0xa0, 0x86, 0x01, 0x00]);

    const val = 0x0186a0n;
    const got = encodeVarInt(val);

    expect(got).toEqual(want);
  });

  test('correct conversion for very large value', () => {
    const want = new Uint8Array([0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]);

    const val = 0x0100000000000000n;
    const got = encodeVarInt(val);
    expect(got).toEqual(want);
  });
});
