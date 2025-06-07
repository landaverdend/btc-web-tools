import { littleEndianToInteger, integerToLittleEndian } from '../helper';

describe('littleEndianToInteger', () => {
  test('should convert a single byte to integer', () => {
    const bytes = new Uint8Array([0x42]);
    expect(littleEndianToInteger(bytes)).toBe(BigInt(0x42));
  });

  test('should convert multiple bytes to integer', () => {
    const bytes = new Uint8Array([0x78, 0x56, 0x34, 0x12]);
    expect(littleEndianToInteger(bytes)).toBe(BigInt(0x12345678));
  });

  test('should handle empty array', () => {
    const bytes = new Uint8Array([]);
    expect(littleEndianToInteger(bytes)).toBe(BigInt(0));
  });

  test('should handle large numbers', () => {
    const bytes = new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
    expect(littleEndianToInteger(bytes)).toBe(BigInt('0xffffffffffffffff'));
  });

  test('should round trip with integerToLittleEndian', () => {
    const original = BigInt(0x1234567890abcdef);
    const bytes = integerToLittleEndian(original);
    const result = littleEndianToInteger(bytes);
    expect(result).toBe(original);
  });
}); 