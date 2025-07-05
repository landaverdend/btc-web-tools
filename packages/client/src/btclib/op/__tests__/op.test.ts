import { hexToBytes } from '@/btclib/util/helper';
import { decodeNumber, encodeNumber } from '../op';

describe('encode_number works', () => {
  test('encode_number works for 0', () => {
    const actual = encodeNumber(0);
    expect(actual).toEqual(new Uint8Array(0));
  });

  test('1', () => {
    const actual = encodeNumber(1);
    expect(actual).toEqual(new Uint8Array([1]));
  });

  test('-1', () => {
    const actual = encodeNumber(-1);
    expect(actual).toEqual(new Uint8Array([0x81]));
  });

  test('-5', () => {
    const actual = encodeNumber(-5);
    expect(actual).toEqual(new Uint8Array([0x85]));
  });

  test('0xffffffffff', () => {
    const actual = encodeNumber(0xffffffffff);
    const expected = hexToBytes('ffffffffff00'); // little endian
    expect(actual).toEqual(expected);
  });

  test('-0xffffffffff', () => {
    const actual = encodeNumber(-0xffffffffff);
    const expected = hexToBytes('ffffffffff80'); // little endian
    expect(actual).toEqual(expected);
  });

  test('-100', () => {
    const actual = encodeNumber(-100);
    const expected = hexToBytes('e4');
    expect(actual).toEqual(expected);
  });
});

describe('decode_number works', () => {
  test('decode_number works for 0', () => {
    const actual = decodeNumber(new Uint8Array(0));
    expect(actual).toEqual(0);
  });

  test('1', () => {
    const actual = decodeNumber(hexToBytes('01'));
    expect(actual).toEqual(1);
  });

  test('-1', () => {
    const actual = decodeNumber(hexToBytes('81'));
    expect(actual).toEqual(-1);
  });

  test('-5', () => {
    const actual = decodeNumber(hexToBytes('85'));
    expect(actual).toEqual(-5);
  });

  test('0xffffffffff', () => {
    const actual = decodeNumber(hexToBytes('ffffffffff00'));
    expect(actual).toEqual(0xffffffffff);
  });

  test('-0xffffffffff', () => {
    const actual = decodeNumber(hexToBytes('ffffffffff80'));
    expect(actual).toEqual(-0xffffffffff);
  });
});
