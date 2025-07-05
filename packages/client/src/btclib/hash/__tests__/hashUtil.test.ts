import { bytesToHex } from '@/btclib/util/helper';
import { hash160, hash256 } from '../hashUtil';

describe('hash functions are working', () => {
  test('hash256 is working', () => {
    const data = new Uint8Array([0x00]);
    const hash = hash256(data);
    const actual = bytesToHex(hash);

    expect(actual).toBe('1406e05881e299367766d313e26c05564ec91bf721d31726bd6e46e60689539a');
  });

  test('hash160 is correct', () => {
    const data = new Uint8Array([0x00]);
    const hash = hash160(data);
    const actual = bytesToHex(hash);

    expect(actual).toBe('9f7fd096d37ed2c0e3f7f0cfc924beef4ffceb68');
  });
});
