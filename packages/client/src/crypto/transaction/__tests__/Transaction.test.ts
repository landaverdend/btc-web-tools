import { hexToBytes } from '@/crypto/util/helper';
import Tx from '../Tx';
// Transactions can be decoded here: https://www.blockchain.com/explorer/assets/btc/decode-transaction

const legacyTx =
  '0100000001813f79011acb80925dfe69b3def355fe914bd1d96a3f5f71bf8303c6a989c7d1000000006b483045022100ed81ff192e75a3fd2304004dcadb746fa5e24c5031ccfcf21320b0277457c98f02207a986d955c6e0cb35d446a89d3f56100f4d7f67801c31967743a9c8e10615bed01210349fc4e631e3624a545de3f89f5d8684c7b8138bd94bdd531d2e213bf016b278afeffffff02a135ef01000000001976a914bc3b654dca7e56b04dca18f2566cdaf02e8d9ada88ac99c39800000000001976a9141c4bc762dd5423e332166702cb75f40df79fea1288ac19430600';

describe('Legacy TX', () => {
  const parsed = Tx.fromHex(legacyTx);

  test('test parse version', () => {
    expect(parsed.version).toBe(1);
  });

  test('test parse inputs', () => {
    expect(parsed.inputs.length).toBe(1);
    const expected = hexToBytes('d1c789a9c60383bf715f3f6ad9d14b91fe55f3deb369fe5d9280cb1a01793f81');
    expect(parsed.inputs[0].txid).toEqual(expected);
    expect(parsed.inputs[0].vout).toBe(0);

    const scriptsighex = parsed.inputs[0].scriptSig.toHex();
    expect(scriptsighex).toBe(
      '6b483045022100ed81ff192e75a3fd2304004dcadb746fa5e24c5031ccfcf21320b0277457c98f02207a986d955c6e0cb35d446a89d3f56100f4d7f67801c31967743a9c8e10615bed01210349fc4e631e3624a545de3f89f5d8684c7b8138bd94bdd531d2e213bf016b278a'
    );
    expect(parsed.inputs[0].sequence).toBe(0xfffffffe);
  });

  test('test parse outputs', () => {
    expect(parsed.outputs.length).toBe(2);
    const amount1 = 32454049;
    expect(parsed.outputs[0].amount).toBe(amount1);
    expect(parsed.outputs[0].scriptPubkey.toHex()).toBe('1976a914bc3b654dca7e56b04dca18f2566cdaf02e8d9ada88ac');

    const amount2 = 10011545;
    expect(parsed.outputs[1].amount).toBe(amount2);
    expect(parsed.outputs[1].scriptPubkey.toHex()).toBe('1976a9141c4bc762dd5423e332166702cb75f40df79fea1288ac');
  });

  test('test locktime', () => {
    expect(parsed.locktime).toBe(410393);
  });

  test('test toBytes', () => {
    const actual = parsed.toBytes();

    const expected = hexToBytes(legacyTx);

    expect(actual).toEqual(expected);
  });

  test('test toHex', () => {
    const actual = parsed.toHex();
    expect(actual).toBe(legacyTx);
  });
});

const segwitTx =
  '010000000001013c735f81c1a0115af2e735554fb271ace18c32a3faf443f9db40cb9a11ca63110000000000ffffffff02b113030000000000160014689a681c462536ad7d735b497511e527e9f59245cf120000000000001600148859f1e9ef3ba438e2ec317f8524ed41f8f06c6a024730440220424772d4ad659960d4f1b541fd853f7da62e8cf505c2f16585dc7c8cf643fe9a02207fbc63b9cf317fc41402b2e7f6fdc1b01f1b43c5456cf9b547fe9645a16dcb150121032533cb19cf37842556dd2168b1c7b6f3a70cff25a6ff4d4b76f2889d2c88a3f200000000';

describe('Segwit TX', () => {
  const parsed = Tx.fromHex(segwitTx);

  test('test parse version', () => {
    expect(parsed.version).toBe(1);
  });

  test('test parse inputs', () => {
    expect(parsed.inputs.length).toBe(1);
    const in1 = parsed.inputs[0];
    expect(in1.txid).toEqual(hexToBytes('3c735f81c1a0115af2e735554fb271ace18c32a3faf443f9db40cb9a11ca6311').reverse());
    expect(in1.vout).toBe(0);
    expect(in1.scriptSig.toHex()).toBe('00'); // Should just hold the 0 varint
    expect(in1.sequence).toBe(0xffffffff);
  });

  test('test parse outputs', () => {
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

    // Total number of witnesses
    expect(witnessData.stack.length).toBe(1);

    const witness = witnessData.stack[0];
    expect(witness.length).toBe(2); // The stack should have 2 items.

    const stackItem1 = witness[0];
    expect(stackItem1.length).toBe(0x47);
    expect(stackItem1).toEqual(
      hexToBytes(
        '30440220424772d4ad659960d4f1b541fd853f7da62e8cf505c2f16585dc7c8cf643fe9a02207fbc63b9cf317fc41402b2e7f6fdc1b01f1b43c5456cf9b547fe9645a16dcb1501'
      )
    );

    const stackItem2 = witness[1];
    expect(stackItem2.length).toBe(0x21);
    expect(stackItem2).toEqual(hexToBytes('032533cb19cf37842556dd2168b1c7b6f3a70cff25a6ff4d4b76f2889d2c88a3f2'));
  });

  test('test locktime', () => {
    expect(parsed.locktime).toBe(0x00000000);
  });

  test('test toBytes', () => {
    const actual = parsed.toHex();
    expect(actual).toEqual(segwitTx);
  });
});

//TODO: test mixed segwit and legacy txs...
const mixedTx =
  '01000000000102f11271713fb911ebdb7daa111470853084c5b4f6ad73582517a73b1131839d71000000006a473044022001187384d8b30020a0ad6976805f0676da8e5fd219ffec084f7c22d2acd4838f0220074e3195a6e624b7ac5cb8e072d77f3b6363968040fc99f268affd4c08e11ac7012103510f10304c99bd53af8b3e47b3e282a75a50dad6f459c4c985898fd800a9e9a8fffffffff11271713fb911ebdb7daa111470853084c5b4f6ad73582517a73b1131839d710100000000ffffffff021027000000000000160014858e1f88ff6f383f45a75088e15a095f20fc663f2c1a0000000000001976a9142241a6c3d4cc3367efaa88b58d24748caef79a7288ac0002473044022035345342616cb5d6eefbbffc1de179ee514587dd15efe5ca892602f50336e30502207864061776e39992f317aee92dcc9595cc754b8f13957441d5ccd9ebd1b5cc0c0121022ed6c7d33a59cc16d37ad9ba54230696bd5424b8931c2a68ce76b0dbbc222f6500000000';
describe('Mixed Segwit and Legacy TX', () => {
  const parsed = Tx.fromHex(mixedTx);

  test('test parse version', () => {
    expect(parsed.version).toBe(1);
  });

  test('test isSegwit', () => {
    expect(parsed.isSegwit).toBe(true);
  });

  test('test parse inputs', () => {
    expect(parsed.inputs.length).toBe(2);

    const in1 = parsed.inputs[0];
    expect(in1.txid).toEqual(hexToBytes('f11271713fb911ebdb7daa111470853084c5b4f6ad73582517a73b1131839d71').reverse());
    expect(in1.vout).toBe(0);

    // Copy over the script sig without the length prefix
    const actual = in1.scriptSig.serializeCommands().toBytes();
    expect(actual).toEqual(
      hexToBytes(
        '473044022001187384d8b30020a0ad6976805f0676da8e5fd219ffec084f7c22d2acd4838f0220074e3195a6e624b7ac5cb8e072d77f3b6363968040fc99f268affd4c08e11ac7012103510f10304c99bd53af8b3e47b3e282a75a50dad6f459c4c985898fd800a9e9a8'
      )
    );

    const in2 = parsed.inputs[1];
    expect(in2.txid).toEqual(hexToBytes('f11271713fb911ebdb7daa111470853084c5b4f6ad73582517a73b1131839d71').reverse());
    expect(in2.vout).toBe(1); // This is a segwit input...
    expect(in2.scriptSig.toHex()).toBe('00');

    expect(in1.sequence).toBe(0xffffffff);
  });

  test('test parse outputs', () => {
    expect(parsed.outputs.length).toBe(2);

    const out1 = parsed.outputs[0];
    expect(out1.amount).toBe(0x2710);

    const actual = out1.scriptPubkey.serializeCommands().toBytes();
    const expected = hexToBytes('0014858e1f88ff6f383f45a75088e15a095f20fc663f');
    expect(actual).toEqual(expected);

    const out2 = parsed.outputs[1];
    expect(out2.amount).toBe(0x1a2c);
    const actual2 = out2.scriptPubkey.serializeCommands().toBytes();
    const expected2 = hexToBytes('76a9142241a6c3d4cc3367efaa88b58d24748caef79a7288ac');
    expect(actual2).toEqual(expected2);
  });

  test('test parse witnesses', () => {
    let { witnessData } = parsed;

    expect(witnessData).toBeDefined();
    witnessData = witnessData!;

    expect(witnessData.stack.length).toBe(2);

    const witness1 = witnessData.stack[0];
    expect(witness1.length).toBe(0);

    const witness2 = witnessData.stack[1];
    expect(witness2.length).toBe(2);

    const stackItem1 = witness2[0];
    expect(stackItem1.length).toBe(0x47);
    expect(stackItem1).toEqual(
      hexToBytes(
        '3044022035345342616cb5d6eefbbffc1de179ee514587dd15efe5ca892602f50336e30502207864061776e39992f317aee92dcc9595cc754b8f13957441d5ccd9ebd1b5cc0c01'
      )
    );

    const stackItem2 = witness2[1];
    expect(stackItem2.length).toBe(0x21);
    expect(stackItem2).toEqual(hexToBytes('022ed6c7d33a59cc16d37ad9ba54230696bd5424b8931c2a68ce76b0dbbc222f65'));
  });

  test('test locktime', () => {
    expect(parsed.locktime).toBe(0x00000000);
  });

  test('test toBytes', () => {
    const actual = parsed.toBytes();
    const expected = hexToBytes(mixedTx);
    expect(actual).toEqual(expected);
  });

  test('test toHex', () => {
    expect(parsed.toHex()).toEqual(mixedTx);
  });

  it('should parse a large coinbase tx with invalid asm', () => {
    expect(() => {
      Tx.fromHex(
        '01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff5103acd8030d00456c696769757300520b197efabe6d6d36cbd738c4a1019da66a452be4e7a72bc9b182c2593d8e8149facd4dff04f7fd0400000000000000002f7373332f0090970208000000000000370effffffff404969b610000000001976a914343ce6ae090cca9389b2d00d7051ce684b0cbc5d88ac961a610a000000001976a91416e3f4ec4dabd9eebb827dda5d58723989a7a61488ac15be6506000000001976a914e638edace9f8bd886792710a17d379a6dc6df50d88aca86ac404000000001976a914abf6fa042b7ab4aa75ce755afa29feb4d315ba1a88aca043b204000000001976a91432d4d75097705b566ed3c11b528a0282517494fa88acd3fa8204000000001976a91411c2c607e59b8005e6308d52a5e488b664a1893488ac2cfc6004000000001976a9141f562c1e41dd90bfd12fccd590207ba3153f7ed688ac5aed6d03000000001976a9148d72578af4c8094ce919789a9201003dfd461aeb88acac360c03000000001976a9148368b7835a40adbb8788b968e6ca76f247adb52388aca283fd02000000001976a914217a637f55892e4327694184dd0d20536186236888acaae4e402000000001976a9148fd9cd1b618d5b9873069544576bb9030fbf78a988ac28d0c402000000001976a9141d32215b3dace0dee862bcc46a6f99523eb05f1c88acd4805502000000001976a91404594e55049cc7bbcc7bd252ac054f1fcf9d0dc988acaab64102000000001976a9146c8a135febf4ab61458ed2d3de1c74b1c2749f5d88ac38e63f02000000001976a914a2665b9c63404cc500c21e97ec0ab60d4600a2cd88ac68a23802000000001976a9149538a23567d9233e3268cd461df9389528c1308b88acbc223702000000001976a914da38a5ee8f8905981b446d3d5cbc62cc6125aad788ac3cc13502000000001976a914f0048d59c5a5a975d795d4e95dd720ab221fa48d88acd5e83402000000001976a914bd0c2b5fb827f6edc78e1a9ca02e357a52d2b79c88ac2e893302000000001976a9143fd9ec42d8f5bf65faf11cd1297ed5dbd0e91ab888ac63ce3102000000001976a914dd98b5c3f3be71942db8b4bec0cd2502ec7d9f2588ac46c32002000000001976a914c962c775412e296ef438c3bc1be84ad69b8ae8d888ac130e1c02000000001976a914df8b6a3f804d9939239979f00976658fc788a14088acc7191302000000001976a914e3f594b1c935c22bc6eeb563c26f5922b1c5753988acfa8ef401000000001976a9147a71b086da1778334c488426c43c2e5cadd7539788ac40edf201000000001976a9140a03406617cb7202f20ae695fbc2db6ff67329e988ac6364f101000000001976a914cfabdde06b6f8dd05507b9886eb66b5079fe5bed88ac54ffef01000000001976a9144e9c9a9b61789a1fda12c646432eb4745c0748ef88acb0b5e501000000001976a914f1cb8fc93af06f1abaa14be3174eda06df129a1888acac01e401000000001976a914534764fb2f6e4fcab01789036135c5b6eb1ffd1e88acb070de01000000001976a9146d27ae5ae7523e2bbb725a652b174291c392c9d788acb9f1b601000000001976a91483afb6e18fed3c86278f18d4d78afad8c504580988ac059fb401000000001976a914d5306819d99e193a914e6e5059cc91502848afc388ac5475ae01000000001976a914368cd9221159bdc2a2862aae0fb122ef2f2a458b88acdef2ab01000000001976a9143f0c4ffe31d9526e66d05d7a7f2822c3a1b74a8788acd97da701000000001976a914c16bcd447c8d1d8938e5dfd9118ee07ef237bd5088ac3686a201000000001976a9143397ccaddd829e93c962c0bee29aff104684c8a688ac593a9f01000000001976a914f9110dfdf179470513fc5387e2ca1f114b79787688accf3a9301000000001976a9144886bee26a467a92b1b71fb3fddee754707f5c5288ac80f88101000000001976a914c8278a624b9264b27d4c92300dc9e7e522beb4cb88acfd257e01000000001976a9141b8a37020704576d83774ab3a7051c7d8d6b5ba988acd74b7c01000000001976a9140bbd59f2712c742b4c7ab31a102c3f343727e7a288ace5f07a01000000001976a9148d20ff772a9ac36f789b96e2fef13ac08b21f63b88ac2e2d5f01000000001976a914001eecd0f4102ce18b9c4bf1c1c547ddad43a71988ac76885301000000001976a914da9d41c79ca85ce0c68057b8adfb753424e7f07a88ac0e8b4c01000000001976a914e8bd104e78fe2e7ee5112ebc23e5c6123e44fa5188ac27274901000000001976a914d334c45f642984e1b473113b3540d0ff1031e75a88acc3ed3601000000001976a914a3fbf39f98b5704f9f4f9aa65681b241a80f820888ac8c953501000000001976a9141ffc58bf7ccf52eeaaa1d20b4e425a1ae0999d4e88ac40ff3301000000001976a914486f1c499cfb2e32fee8043bfdf19eb5dc9d493a88ac02c32f01000000001976a914bfb3bb3176652e6cbe926d2ea51416eb7558b5c488ac361d2e01000000001976a914b3cf53a6e3ff82c00b467d9ee9d3c23407a8439d88ac09c52c01000000001976a9146d8096de881bca5fd3385655376b868e3201ef2488ac57812c01000000001976a914012b648dd91241bc2bb70c055f9d57c8fbded81a88ac31f72501000000001976a91471e8822a58e9a693f90c277c1314dc718528176988acd5672201000000001976a914954a4dc953aa435599e5949aa758262fa9f5cf3188ac69a41f01000000001976a914563ae3b5c24f35dffeefdc1d26ca427d35cd5cfa88aceea81a01000000001976a91435e5ca4e69131c1dd83982cf2d369e85d1c0c4ee88acb70d1601000000001976a91403790c19fa7c743622d4dbee16b3c59e63c3800088ac0f781301000000001976a914a847bdfbd1fc716ac4c38652bc0042e6b0c812b888acaf4a1301000000001976a914ee4f83c1dc1e5e81f36b48ba236ca116e894f2cc88acf4fe1001000000001976a9143161471a83dc2ecc5c3c3d7a4d3dc3628e2667ef88ac47f90501000000001976a914226c1eee79f5ed89ea65ed078751af96c14e7ac388ac01000000000000001976a9145399c3093d31e4b0af4be1215d59b857b861ad5d88ac00000000'
      );
    }).not.toThrow();
  });
});
