import { hexToBytes } from '@/crypto/util/helper';
import Tx from '../Tx';

// Transactions can be decoded here: https://www.blockchain.com/explorer/assets/btc/decode-transaction

const legacyTx =
  '0100000001813f79011acb80925dfe69b3def355fe914bd1d96a3f5f71bf8303c6a989c7d1000000006b483045022100ed81ff192e75a3fd2304004dcadb746fa5e24c5031ccfcf21320b0277457c98f02207a986d955c6e0cb35d446a89d3f56100f4d7f67801c31967743a9c8e10615bed01210349fc4e631e3624a545de3f89f5d8684c7b8138bd94bdd531d2e213bf016b278afeffffff02a135ef01000000001976a914bc3b654dca7e56b04dca18f2566cdaf02e8d9ada88ac99c39800000000001976a9141c4bc762dd5423e332166702cb75f40df79fea1288ac19430600';

describe('Legacy TX', () => {
  test('test parse version', () => {
    const parsed = Tx.fromHex(legacyTx);

    expect(parsed.version).toBe(1);
  });

  test('test parse inputs', () => {
    const parsed = Tx.fromHex(legacyTx);

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
    const parsed = Tx.fromHex(legacyTx);

    expect(parsed.outputs.length).toBe(2);
    const amount1 = 32454049;
    expect(parsed.outputs[0].amount).toBe(amount1);
    expect(parsed.outputs[0].scriptPubkey.toHex()).toBe('1976a914bc3b654dca7e56b04dca18f2566cdaf02e8d9ada88ac');

    const amount2 = 10011545;
    expect(parsed.outputs[1].amount).toBe(amount2);
    expect(parsed.outputs[1].scriptPubkey.toHex()).toBe('1976a9141c4bc762dd5423e332166702cb75f40df79fea1288ac');
  });

  test('test locktime', () => {
    const parsed = Tx.fromHex(legacyTx);

    expect(parsed.locktime).toBe(410393);
  });

  test('test toBytes', () => {
    const parsed = Tx.fromHex(legacyTx);
    const actual = parsed.toBytes();

    const expected = hexToBytes(legacyTx);

    expect(actual).toEqual(expected);
  });

  test('test toHex', () => {
    const parsed = Tx.fromHex(legacyTx);

    const actual = parsed.toHex();
    expect(actual).toBe(legacyTx);
  });
});

const segwitTx =
  '010000000001013c735f81c1a0115af2e735554fb271ace18c32a3faf443f9db40cb9a11ca63110000000000ffffffff02b113030000000000160014689a681c462536ad7d735b497511e527e9f59245cf120000000000001600148859f1e9ef3ba438e2ec317f8524ed41f8f06c6a024730440220424772d4ad659960d4f1b541fd853f7da62e8cf505c2f16585dc7c8cf643fe9a02207fbc63b9cf317fc41402b2e7f6fdc1b01f1b43c5456cf9b547fe9645a16dcb150121032533cb19cf37842556dd2168b1c7b6f3a70cff25a6ff4d4b76f2889d2c88a3f200000000';

describe('Segwit TX', () => {
  test('test parse version', () => {
    const parsed = Tx.fromHex(segwitTx);

    expect(parsed.version).toBe(1);
  });

  test('test parse inputs', () => {
    const parsed = Tx.fromHex(segwitTx);

    expect(parsed.inputs.length).toBe(1);
    const in1 = parsed.inputs[0];
    expect(in1.prevTx).toEqual(hexToBytes('3c735f81c1a0115af2e735554fb271ace18c32a3faf443f9db40cb9a11ca6311').reverse());
    expect(in1.prevIndex).toBe(0);
    expect(in1.scriptSig.toHex()).toBe('00'); // Should just hold the 0 varint
    expect(in1.sequence).toBe(0xffffffff);
  });

  test('test parse outputs', () => {
    const parsed = Tx.fromHex(segwitTx);

    expect(parsed.outputs.length).toBe(2);
    const out1 = parsed.outputs[0];
    expect(out1.amount).toBe(0x0313b1);

    const actual = out1.scriptPubkey.serializeCommands().toBytes();
    const expected = hexToBytes('0014689a681c462536ad7d735b497511e527e9f59245');
    expect(actual).toEqual(expected);

    const out2 = parsed.outputs[1];
    expect(out2.amount).toBe(0x12cf);
    const actual2 = out2.scriptPubkey.serializeCommands().toBytes();

    const expected2 = hexToBytes('00148859f1e9ef3ba438e2ec317f8524ed41f8f06c6a');
    expect(actual2).toEqual(expected2);
  });

  test('test parse witnesses', () => {
    let { witnessData } = Tx.fromHex(segwitTx);

    expect(witnessData).toBeDefined();
    witnessData = witnessData!;

    expect(witnessData.stack.length).toBe(2);
    const witness1 = witnessData.stack[0];
    expect(witness1.length).toBe(0x47);
    expect(witness1).toEqual(
      hexToBytes(
        '30440220424772d4ad659960d4f1b541fd853f7da62e8cf505c2f16585dc7c8cf643fe9a02207fbc63b9cf317fc41402b2e7f6fdc1b01f1b43c5456cf9b547fe9645a16dcb1501'
      )
    );

    const witness2 = witnessData.stack[1];
    expect(witness2.length).toBe(0x21);
    expect(witness2).toEqual(hexToBytes('032533cb19cf37842556dd2168b1c7b6f3a70cff25a6ff4d4b76f2889d2c88a3f2'));
  });

  test('test locktime', () => {
    const parsed = Tx.fromHex(segwitTx);

    expect(parsed.locktime).toBe(0x00000000);
  });

  test('test toBytes', () => {
    const parsed = Tx.fromHex(segwitTx);

    const actual = parsed.toHex();
    expect(actual).toEqual(segwitTx);
  });
});

//TODO: test mixed segwit and legacy txs...
