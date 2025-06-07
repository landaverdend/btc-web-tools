import { integerToLittleEndian, littleEndianToInteger } from '@/util/helper';

export default function TxView() {
  const big = BigInt(0x12345678);
  const buffer = integerToLittleEndian(big);
  const big2 = littleEndianToInteger(buffer);

  console.log('Original number:', big.toString(16));
  console.log(
    'Buffer in hex:',
    Array.from(buffer)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  );
  console.log('Converted back:', big2.toString(16));

  return <div></div>;
}
