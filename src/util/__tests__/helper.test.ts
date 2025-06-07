import { littleEndianToInteger, integerToLittleEndian } from '../helper';

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

    expect(got).toEqual(want)
  });
});
