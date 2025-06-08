import { hexToBytes } from '@/util/helper';
import Tx from '../Tx';

// Transactions can be decoded here: https://www.blockchain.com/explorer/assets/btc/decode-transaction

const tx =
  '0100000001813f79011acb80925dfe69b3def355fe914bd1d96a3f5f71bf8303c6a989c7d1000000006b483045022100ed81ff192e75a3fd2304004dcadb746fa5e24c5031ccfcf21320b0277457c98f02207a986d955c6e0cb35d446a89d3f56100f4d7f67801c31967743a9c8e10615bed01210349fc4e631e3624a545de3f89f5d8684c7b8138bd94bdd531d2e213bf016b278afeffffff02a135ef01000000001976a914bc3b654dca7e56b04dca18f2566cdaf02e8d9ada88ac99c39800000000001976a9141c4bc762dd5423e332166702cb75f40df79fea1288ac19430600';

describe('Transaction', () => {
  test('test parse version', () => {
    const parsed = Tx.fromHex(tx);

    expect(parsed.version).toBe(1);
  });

  test('test parse inputs', () => {
    const parsed = Tx.fromHex(tx);

    expect(parsed.inputs.length).toBe(1);
    const expected = hexToBytes('d1c789a9c60383bf715f3f6ad9d14b91fe55f3deb369fe5d9280cb1a01793f81');
    expect(parsed.inputs[0].prevTx).toEqual(expected);
    expect(parsed.inputs[0].prevIndex).toBe(0);

    const scriptsighex = parsed.inputs[0].scriptSig.toHex();
    expect(scriptsighex).toBe(
      '6b483045022100ed81ff192e75a3fd2304004dcadb746fa5e24c5031ccfcf21320b0277457c98f02207a986d955c6e0cb35d446a89d3f56100f4d7f67801c31967743a9c8e10615bed01210349fc4e631e3624a545de3f89f5d8684c7b8138bd94bdd531d2e213bf016b278a'
    );
    expect(parsed.inputs[0].sequence).toBe(0xfffffffe);
  });

  test('test parse outputs', () => {
    const parsed = Tx.fromHex(tx);

    expect(parsed.outputs.length).toBe(2);
    const amount1 = 32454049;
    expect(parsed.outputs[0].value).toBe(amount1);
    expect(parsed.outputs[0].scriptPubkey.toHex()).toBe('1976a914bc3b654dca7e56b04dca18f2566cdaf02e8d9ada88ac');

    const amount2 = 10011545;
    expect(parsed.outputs[1].value).toBe(amount2);
    expect(parsed.outputs[1].scriptPubkey.toHex()).toBe('1976a9141c4bc762dd5423e332166702cb75f40df79fea1288ac');
  });

  test('test locktime', () => {
    const parsed = Tx.fromHex(tx);

    expect(parsed.locktime).toBe(410393);
  });
});
