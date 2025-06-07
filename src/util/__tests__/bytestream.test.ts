import { ByteStream } from '../ByteStream';

// These should all include data after the varint to make sure nothing is chopped off.
describe('ByteStream ', () => {
  test('correct conversion for small value', () => {
    const bytes = new Uint8Array([0x01, 0xff, 0xff]);
    const stream = new ByteStream(bytes);

    const want = 1;
    const got = stream.readVarInt();

    expect(got).toEqual(want);
  });

  test('correct conversion for medium value', () => {
    const bytes = new Uint8Array([0xfd, 0xf4, 0x01, 0xff, 0xff, 0xff]); // little endian 0x01f4
    const stream = new ByteStream(bytes);

    const want = 0x01f4n;
    const got = stream.readVarInt();

    expect(got).toEqual(want);
  });

  test('correct conversion for large value', () => {
    const bytes = new Uint8Array([0xfe, 0xa0, 0x86, 0x01, 0x00, 0xff, 0xff, 0xff]);
    const stream = new ByteStream(bytes);

    const want = 0x0186a0n;
    const got = stream.readVarInt();

    expect(got).toEqual(want);
  });

  test('correct conversion for very large value', () => {
    const bytes = new Uint8Array([0xff, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff]);
    const stream = new ByteStream(bytes);

    // const want = 0x010000000000000000n;
    const want = 1n;
    const got = stream.readVarInt();
    expect(got).toEqual(want);
  });
});
