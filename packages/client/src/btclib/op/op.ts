import { ripemd160, sha1 } from '@noble/hashes/legacy';
import { sha256 } from '@noble/hashes/sha2';
import { hash160, hash256 } from '../../btclib/hash/hashUtil';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import { Script } from '../script/Script';
import { ExecutionContext, TxContext } from '../script/execution/executionContext';
import { bytesToHex } from '../util/helper';

export function encodeNumber(num: number) {
  if (num === 0) {
    return new Uint8Array(0);
  }

  const absNum = Math.abs(num);
  const negative = num < 0;

  const bytes: number[] = [];
  let remaining = absNum;

  while (remaining > 0) {
    bytes.push(remaining & 0xff);
    remaining = Math.floor(remaining / 256);
  }

  // Handle sign bit: highest bit is 1 if negative
  if (bytes[bytes.length - 1] & 0x80) {
    if (negative) {
      bytes.push(0x80);
    } else {
      bytes.push(0);
    }
  } else if (negative) {
    bytes[bytes.length - 1] |= 0x80;
  }

  return new Uint8Array(bytes);
}

export function decodeNumber(bytes: Uint8Array) {
  if (bytes.length === 0) {
    return 0;
  }

  const bytesCopy = new Uint8Array([...bytes]);
  const bigEndian = bytesCopy.reverse();
  const isNegative = (bigEndian[0] & 0x80) !== 0;

  let result = isNegative ? bigEndian[0] & 0x7f : bigEndian[0];
  for (let i = 1; i < bigEndian.length; i++) {
    result = result * 256 + bigEndian[i];
  }
  return isNegative ? -result : result;
}

function op_pushbytes(ctx: ExecutionContext, opcode: number) {
  const { script, stack } = ctx;
  const dataToPush = script.cmds[ctx.programCounter + 1] as Uint8Array;

  stack.push(dataToPush);
  return true;
}

function isEncodedZero(bytes: Uint8Array) {
  return bytes.length === 0 || (bytes.length === 1 && bytes[0] === 0);
}

function op_nop({}: ExecutionContext) {
  return true;
}

function op_0({ stack }: ExecutionContext) {
  stack.push(encodeNumber(0));
  return true;
}
function op_1negate({ stack }: ExecutionContext) {
  stack.push(encodeNumber(-1));
  return true;
}

function op_1({ stack }: ExecutionContext) {
  stack.push(encodeNumber(1));
  return true;
}

function op_2({ stack }: ExecutionContext) {
  stack.push(encodeNumber(2));
  return true;
}

function op_3({ stack }: ExecutionContext) {
  stack.push(encodeNumber(3));
  return true;
}

function op_4({ stack }: ExecutionContext) {
  stack.push(encodeNumber(4));
  return true;
}

function op_5({ stack }: ExecutionContext) {
  stack.push(encodeNumber(5));
  return true;
}

function op_6({ stack }: ExecutionContext) {
  stack.push(encodeNumber(6));
  return true;
}

function op_7({ stack }: ExecutionContext) {
  stack.push(encodeNumber(7));
  return true;
}

function op_8({ stack }: ExecutionContext) {
  stack.push(encodeNumber(8));
  return true;
}

function op_9({ stack }: ExecutionContext) {
  stack.push(encodeNumber(9));
  return true;
}

function op_10({ stack }: ExecutionContext) {
  stack.push(encodeNumber(10));
  return true;
}

function op_11({ stack }: ExecutionContext) {
  stack.push(encodeNumber(11));
  return true;
}

function op_12({ stack }: ExecutionContext) {
  stack.push(encodeNumber(12));
  return true;
}

function op_13({ stack }: ExecutionContext) {
  stack.push(encodeNumber(13));
  return true;
}

function op_14({ stack }: ExecutionContext) {
  stack.push(encodeNumber(14));
  return true;
}

function op_15({ stack }: ExecutionContext) {
  stack.push(encodeNumber(15));
  return true;
}

function op_16({ stack }: ExecutionContext) {
  stack.push(encodeNumber(16));
  return true;
}

// We need to parse ahead of the instruction stream to see if the next instruction is an OP_ELSE or OP_ENDIF
function op_if(ctx: ExecutionContext) {
  const { stack } = ctx;
  if (stack.length < 1) return false;

  const top = stack.pop()!;

  // If top item is false (0), consult the jump table for the next PC instruction.
  if (isEncodedZero(top)) {
    const nextPC = ctx.script.jumpTable[ctx.programCounter];
    ctx.programCounter = nextPC;
  }

  return true;
}

// Inverse of OP_IF
function op_notif(ctx: ExecutionContext) {
  const { stack } = ctx;
  if (stack.length < 1) return false;

  const top = stack.pop()!;
  // Inverse logic of OP_IF: go to next block if 0
  if (!isEncodedZero(top)) {
    const nextPC = ctx.script.jumpTable[ctx.programCounter];
    ctx.programCounter = nextPC;
  }

  return true;
}

// ALWAYS jump when we see an OP_ELSE
function op_else(ctx: ExecutionContext) {
  const nextPC = ctx.script.jumpTable[ctx.programCounter];
  ctx.programCounter = nextPC;

  return true;
}

function op_endif({}: ExecutionContext) {
  return true;
}

function op_verify({ stack }: ExecutionContext) {
  if (stack.length < 1) {
    return false;
  }

  const el = decodeNumber(stack.pop()!);
  if (el === 0) {
    return false;
  }

  return true;
}

function op_pushdata1({}: ExecutionContext) {
  return true;
}

function op_pushdata2({}: ExecutionContext) {
  return true;
}

function op_pushdata4({}: ExecutionContext) {
  return true;
}

function op_return() {
  return false;
}

function op_toaltstack({ stack, altStack }: ExecutionContext) {
  if (stack.length < 1) {
    return false;
  }
  altStack.push(stack.pop()!);
  return true;
}

function op_fromaltstack({ stack, altStack }: ExecutionContext) {
  if (altStack.length < 1) {
    return false;
  }
  stack.push(altStack.pop()!);
  return true;
}

function op_2drop({ stack }: ExecutionContext) {
  if (stack.length < 2) {
    return false;
  }

  stack.pop();
  stack.pop();

  return true;
}

function op_2dup({ stack }: ExecutionContext) {
  if (stack.length < 2) {
    return false;
  }

  const first = stack[stack.length - 1];
  const second = stack[stack.length - 2];

  stack.push(second);
  stack.push(first);

  return true;
}

function op_3dup({ stack }: ExecutionContext) {
  if (stack.length < 3) {
    return false;
  }

  const first = stack[stack.length - 1];
  const second = stack[stack.length - 2];
  const third = stack[stack.length - 3];

  stack.push(third);
  stack.push(second);
  stack.push(first);

  return true;
}

function op_2over({ stack }: ExecutionContext) {
  if (stack.length < 4) {
    return false;
  }

  const third = stack[stack.length - 3];
  const fourth = stack[stack.length - 4];

  stack.push(fourth);
  stack.push(third);

  return true;
}

function op_2rot({ stack }: ExecutionContext) {
  if (stack.length < 6) {
    return false;
  }

  const removed = stack.splice(stack.length - 6, 2);
  stack.push(...removed);

  return true;
}

function op_2swap({ stack }: ExecutionContext) {
  if (stack.length < 4) {
    return false;
  }

  const removed = stack.splice(stack.length - 4, 2);
  stack.push(...removed);

  return true;
}

function op_ifdup({ stack }: ExecutionContext) {
  if (stack.length < 1) {
    return false;
  }

  const top = stack[stack.length - 1];
  if (!isEncodedZero(top)) {
    stack.push(top);
  }
  return true;
}

function op_depth({ stack }: ExecutionContext) {
  stack.push(encodeNumber(stack.length));
  return true;
}

function op_drop({ stack }: ExecutionContext) {
  if (stack.length < 1) {
    return false;
  }
  stack.pop();

  return true;
}

function op_dup({ stack }: ExecutionContext) {
  if (stack.length < 1) {
    return false;
  }

  const top = stack[stack.length - 1];
  stack.push(top);

  return true;
}

function op_nip({ stack }: ExecutionContext) {
  if (stack.length < 2) {
    return false;
  }

  stack.splice(stack.length - 2, 1);

  return true;
}

function op_over({ stack }: ExecutionContext) {
  if (stack.length < 2) {
    return false;
  }

  stack.push(stack[stack.length - 2]);

  return true;
}

function op_pick({ stack }: ExecutionContext) {
  if (stack.length < 2) {
    return false;
  }

  const n = decodeNumber(stack.pop()!);

  if (n < 0 || n >= stack.length) {
    return false;
  }

  const el = stack[stack.length - n - 1];
  stack.push(el);

  return true;
}

function op_roll({ stack }: ExecutionContext) {
  if (stack.length < 2) {
    return false;
  }

  const n = decodeNumber(stack.pop()!);

  if (n < 0 || n >= stack.length) {
    return false;
  }

  const removed = stack.splice(stack.length - n - 1, 1);
  stack.push(removed[0]);

  return true;
}

function op_rot({ stack }: ExecutionContext) {
  if (stack.length < 3) {
    return false;
  }

  const removed = stack.splice(stack.length - 3, 1);
  stack.push(removed[0]);

  return true;
}

function op_swap({ stack }: ExecutionContext) {
  if (stack.length < 2) {
    return false;
  }

  const first = stack.pop()!;
  const second = stack.pop()!;

  stack.push(first);
  stack.push(second);

  return true;
}

function op_tuck({ stack }: ExecutionContext) {
  if (stack.length < 2) {
    return false;
  }

  const first = stack.pop()!;
  const second = stack.pop()!;

  stack.push(...[first, second, first]);

  return true;
}

function op_size({ stack }: ExecutionContext) {
  if (stack.length < 1) {
    return false;
  }

  const top = stack[stack.length - 1];
  stack.push(encodeNumber(top.length));

  return true;
}

function op_equal({ stack }: ExecutionContext) {
  if (stack.length < 2) {
    return false;
  }

  const el1 = decodeNumber(stack.pop()!);
  const el2 = decodeNumber(stack.pop()!);

  if (el1 === el2) {
    stack.push(encodeNumber(1));
  } else {
    stack.push(encodeNumber(0));
  }

  return true;
}

function op_equalverify({ stack }: ExecutionContext) {
  if (stack.length < 2) {
    return false;
  }

  const el1 = decodeNumber(stack.pop()!);
  const el2 = decodeNumber(stack.pop()!);

  if (el1 !== el2) {
    return false;
  }

  return true;
}

function op_1add({ stack }: ExecutionContext) {
  if (stack.length < 1) {
    return false;
  }

  const el = decodeNumber(stack.pop()!);
  stack.push(encodeNumber(el + 1));

  return true;
}

function op_1sub({ stack }: ExecutionContext) {
  if (stack.length < 1) {
    return false;
  }

  const el = decodeNumber(stack.pop()!);
  stack.push(encodeNumber(el - 1));

  return true;
}

function op_negate({ stack }: ExecutionContext) {
  if (stack.length < 1) {
    return false;
  }

  const el = decodeNumber(stack.pop()!);
  stack.push(encodeNumber(-el));

  return true;
}

function op_abs({ stack }: ExecutionContext) {
  if (stack.length < 1) {
    return false;
  }

  const el = decodeNumber(stack.pop()!);
  stack.push(encodeNumber(Math.abs(el)));

  return true;
}

function op_not({ stack }: ExecutionContext) {
  if (stack.length < 1) {
    return false;
  }

  const el = decodeNumber(stack.pop()!);
  stack.push(encodeNumber(el === 0 ? 1 : 0));

  return true;
}

function op_0notequal({ stack }: ExecutionContext) {
  if (stack.length < 1) {
    return false;
  }

  const el = decodeNumber(stack.pop()!);
  stack.push(encodeNumber(el === 0 ? 0 : 1));

  return true;
}

function op_add({ stack }: ExecutionContext) {
  if (stack.length < 2) {
    return false;
  }

  const el1 = decodeNumber(stack.pop()!);
  const el2 = decodeNumber(stack.pop()!);
  stack.push(encodeNumber(el1 + el2));

  return true;
}

function op_sub({ stack }: ExecutionContext) {
  if (stack.length < 2) {
    return false;
  }

  const el1 = decodeNumber(stack.pop()!);
  const el2 = decodeNumber(stack.pop()!);
  stack.push(encodeNumber(el2 - el1));

  return true;
}

// NOTE: OP_MUL is not normally used in BTC script and is generally disabled.
function op_mul({ stack }: ExecutionContext) {
  if (stack.length < 2) {
    return false;
  }

  const el1 = decodeNumber(stack.pop()!);
  const el2 = decodeNumber(stack.pop()!);
  stack.push(encodeNumber(el1 * el2));

  return true;
}

function op_booland({ stack }: ExecutionContext) {
  if (stack.length < 2) {
    return false;
  }

  const bytes1 = stack.pop()!;
  const bytes2 = stack.pop()!;

  // Must be 4 bytes or less..
  if (bytes1.length > 4 || bytes2.length > 4) {
    return false;
  }

  const num1 = decodeNumber(bytes1);
  const num2 = decodeNumber(bytes2);

  if (num1 !== 0 && num2 !== 0) {
    stack.push(encodeNumber(1));
  } else {
    stack.push(encodeNumber(0));
  }

  return true;
}

function op_boolor({ stack }: ExecutionContext) {
  if (stack.length < 2) {
    return false;
  }

  const num1 = decodeNumber(stack.pop()!);
  const num2 = decodeNumber(stack.pop()!);

  if (num1 || num2) {
    stack.push(encodeNumber(1));
  } else {
    stack.push(encodeNumber(0));
  }

  return true;
}

function op_numequal({ stack }: ExecutionContext) {
  if (stack.length < 2) {
    return false;
  }

  const num1 = decodeNumber(stack.pop()!);
  const num2 = decodeNumber(stack.pop()!);

  if (num1 === num2) {
    stack.push(encodeNumber(1));
  } else {
    stack.push(encodeNumber(0));
  }

  return true;
}

function op_numequalverify({ stack }: ExecutionContext) {
  if (stack.length < 2) {
    return false;
  }

  const num1 = decodeNumber(stack.pop()!);
  const num2 = decodeNumber(stack.pop()!);

  if (num1 !== num2) {
    return false;
  }

  return true;
}

function op_numnotequal({ stack }: ExecutionContext) {
  if (stack.length < 2) {
    return false;
  }

  const num1 = decodeNumber(stack.pop()!);
  const num2 = decodeNumber(stack.pop()!);

  if (num1 !== num2) {
    stack.push(encodeNumber(1));
  } else {
    stack.push(encodeNumber(0));
  }

  return true;
}

function op_lessthan({ stack }: ExecutionContext) {
  if (stack.length < 2) {
    return false;
  }

  const a = decodeNumber(stack.pop()!);
  const b = decodeNumber(stack.pop()!);

  if (b < a) {
    stack.push(encodeNumber(1));
  } else {
    stack.push(encodeNumber(0));
  }

  return true;
}

function op_greaterthan({ stack }: ExecutionContext) {
  if (stack.length < 2) {
    return false;
  }

  const a = decodeNumber(stack.pop()!);
  const b = decodeNumber(stack.pop()!);

  if (b > a) {
    stack.push(encodeNumber(1));
  } else {
    stack.push(encodeNumber(0));
  }

  return true;
}

function op_lessthanorequal({ stack }: ExecutionContext) {
  if (stack.length < 2) {
    return false;
  }

  const a = decodeNumber(stack.pop()!);
  const b = decodeNumber(stack.pop()!);

  if (b <= a) {
    stack.push(encodeNumber(1));
  } else {
    stack.push(encodeNumber(0));
  }

  return true;
}

function op_greaterthanorequal({ stack }: ExecutionContext) {
  if (stack.length < 2) {
    return false;
  }

  const a = decodeNumber(stack.pop()!);
  const b = decodeNumber(stack.pop()!);

  if (b >= a) {
    stack.push(encodeNumber(1));
  } else {
    stack.push(encodeNumber(0));
  }

  return true;
}

function op_min({ stack }: ExecutionContext) {
  if (stack.length < 2) {
    return false;
  }

  const a = decodeNumber(stack.pop()!);
  const b = decodeNumber(stack.pop()!);

  if (a < b) {
    stack.push(encodeNumber(a));
  } else {
    stack.push(encodeNumber(b));
  }

  return true;
}

function op_max({ stack }: ExecutionContext) {
  if (stack.length < 2) {
    return false;
  }

  const a = decodeNumber(stack.pop()!);
  const b = decodeNumber(stack.pop()!);

  if (a > b) {
    stack.push(encodeNumber(a));
  } else {
    stack.push(encodeNumber(b));
  }

  return true;
}

function op_within({ stack }: ExecutionContext) {
  if (stack.length < 3) {
    return false;
  }

  const max = decodeNumber(stack.pop()!);
  const min = decodeNumber(stack.pop()!);
  const x = decodeNumber(stack.pop()!);

  if (x >= min && x < max) {
    stack.push(encodeNumber(1));
  } else {
    stack.push(encodeNumber(0));
  }

  return true;
}

function op_ripemd160({ stack }: ExecutionContext) {
  if (stack.length < 1) {
    return false;
  }

  const bytes = stack.pop()!;
  const hash = ripemd160(bytes);

  stack.push(hash);
  return true;
}

function op_sha1({ stack }: ExecutionContext) {
  if (stack.length < 1) {
    return false;
  }

  const bytes = stack.pop()!;
  const hash = sha1(bytes);

  stack.push(hash);

  return true;
}

function op_sha256({ stack }: ExecutionContext) {
  if (stack.length < 1) {
    return false;
  }

  const bytes = stack.pop()!;
  const hash = sha256(bytes);

  stack.push(hash);

  return true;
}

function op_hash160({ stack }: ExecutionContext) {
  if (stack.length < 1) {
    return false;
  }

  const bytes = stack.pop()!;
  const hash = hash160(bytes);

  stack.push(hash);

  return true;
}

function op_hash256({ stack }: ExecutionContext) {
  if (stack.length < 1) {
    return false;
  }

  const bytes = stack.pop()!;
  const hash = hash256(bytes);

  stack.push(hash);
  return true;
}

// Pass in the txContext and spit out the sighash for the selected input...
function calcp2pkhSighash(txContext: TxContext) {
  const { txMetadata, selectedInputIndex, tx } = txContext!;
  const prevScriptPubkey = txMetadata!.vin[selectedInputIndex].prevout!.scriptpubkey;
  const sighash = tx?.sighash(selectedInputIndex, Script.fromHex(prevScriptPubkey));

  return sighash;
}

function op_checksig({ stack, txContext }: ExecutionContext) {
  if (stack.length < 2) {
    return false;
  }

  const sighash = calcp2pkhSighash(txContext!);

  const sec_pubkey = stack.pop()!;
  const der_signature = stack.pop()!.slice(0, -1);

  try {
    const isValid = secp256k1.verify(der_signature, sighash, sec_pubkey, { format: 'der' });

    if (isValid || txContext?.tx.isSegwit) {
      stack.push(encodeNumber(1));
    } else {
      stack.push(encodeNumber(0));
    }

    return true;
  } catch (error) {
    console.error('Error in OP_CHECKSIG: ', error);
    stack.push(encodeNumber(0));
    return true;
  }
}

function op_checksigverify({ stack, txContext }: ExecutionContext) {
  if (stack.length < 2) {
    return false;
  }

  const sighash = calcp2pkhSighash(txContext!);

  const sec_pubkey = stack.pop()!;
  const der_signature = stack.pop()!.slice(0, -1);

  try {
    const isValid = secp256k1.verify(der_signature, sighash, sec_pubkey, { format: 'der' });

    if (isValid) {
      stack.push(encodeNumber(1));
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error in OP_CHECKSIG: ', error);
    stack.push(encodeNumber(0));
    return true;
  }
}

function calcP2shSighash(txContext: TxContext) {
  const { txMetadata, selectedInputIndex, tx } = txContext!;
  const scriptsig = Script.fromHex(txMetadata!.vin[selectedInputIndex].scriptsig, true);

  // Redeem script goes in the sighash
  const redeemScriptBytes = scriptsig.cmds[scriptsig.cmds.length - 1] as Uint8Array;
  const redeemScript = Script.fromHex(bytesToHex(redeemScriptBytes));

  const sighash = tx?.sighash(selectedInputIndex, redeemScript);

  return sighash;
}

function op_checkmultisig({ stack, txContext }: ExecutionContext) {
  if (stack.length < 1) return false;

  const n = decodeNumber(stack.pop()!);
  if (stack.length < n + 1) return false;

  const pubkeys: Uint8Array[] = [];

  for (let i = 0; i < n; i++) {
    pubkeys.push(stack.pop()!);
  }

  const m = decodeNumber(stack.pop()!);
  if (stack.length < m) return false;

  const signatures: Uint8Array[] = [];
  for (let i = 0; i < m; i++) {
    signatures.push(stack.pop()!);
  }

  // Pop off the dummy value....
  stack.pop();

  // Fix this...calculate segwit sighash
  if (txContext?.tx.isSegwit) {
    stack.push(encodeNumber(1));
    return true;
  }
  const sighash = calcP2shSighash(txContext!);

  // Test every single signature against every single pubkey
  let sigIdx = 0;
  let keyIdx = 0;
  while (sigIdx < m && keyIdx < n) {
    const sigDER = signatures[sigIdx].slice(0, -1);
    if (secp256k1.verify(sigDER, sighash, pubkeys[keyIdx], { format: 'der' })) sigIdx++;
    keyIdx++;
  }

  const success = sigIdx === m;
  if (success) {
    stack.push(encodeNumber(1));
  } else {
    stack.push(encodeNumber(0));
  }

  return true;
}

function op_checkmultisigverify({ stack, txContext }: ExecutionContext) {
  if (stack.length < 1) return false;

  const n = decodeNumber(stack.pop()!);
  if (stack.length < n + 1) return false;

  const pubkeys: Uint8Array[] = [];

  for (let i = 0; i < n; i++) {
    pubkeys.push(stack.pop()!);
  }

  const m = decodeNumber(stack.pop()!);
  if (stack.length < m) return false;

  const signatures: Uint8Array[] = [];
  for (let i = 0; i < m; i++) {
    signatures.push(stack.pop()!);
  }

  // Pop off the dummy value....
  stack.pop();

  // Fix this...calculate segwit sighash
  if (txContext?.tx.isSegwit) {
    return true;
  }
  const sighash = calcP2shSighash(txContext!);

  // Test every single signature against every single pubkey
  let sigIdx = 0;
  let keyIdx = 0;
  while (sigIdx < m && keyIdx < n) {
    const sigDER = signatures[sigIdx].slice(0, -1);
    if (secp256k1.verify(sigDER, sighash, pubkeys[keyIdx], { format: 'der' })) sigIdx++;
    keyIdx++;
  }

  const success = sigIdx === m;
  if (success) {
    return true;
  } else {
    return false;
  }
}
function getLocktimeType(locktime: number) {
  if (locktime >= 500000000) {
    return 'timestamp';
  } else {
    return 'block';
  }
}

function op_checklocktimeverify({ stack, txContext }: ExecutionContext) {
  if (stack.length < 1) return false;

  const locktime = decodeNumber(stack.pop()!);
  const locktimeType = getLocktimeType(locktime);

  const txLocktime = txContext!.txMetadata.locktime;
  const txLocktimeType = getLocktimeType(txLocktime);

  if (locktimeType !== txLocktimeType) return false;

  if (locktime > txLocktime) {
    return false;
  }

  return true;
}

function op_checksequenceverify({ stack, txContext }: ExecutionContext) {
  if (stack.length < 1) return false;

  const peek = decodeNumber(stack[stack.length - 1]!);
  const input = txContext!.txMetadata.vin[txContext!.selectedInputIndex];

  const locktime = input.sequence;
  const locktimeType = getLocktimeType(locktime);
  const peekType = getLocktimeType(peek);

  if (peekType !== locktimeType) return false;
  if (txContext!.tx.version < 2) return false;

  return true;
}

// Multiple types of functions are possible...

function fillPushBytes() {
  const pushBytes: Record<number, (context: ExecutionContext) => boolean> = {};
  for (let i = 1; i <= 75; i++) {
    pushBytes[i] = (context: ExecutionContext) => {
      return op_pushbytes(context, i);
    };
  }

  return pushBytes;
}

export const OP_CODE_FUNCTIONS: Record<number, (context: ExecutionContext) => boolean> = {
  0: op_0,
  ...fillPushBytes(),
  76: op_pushdata1,
  77: op_pushdata2,
  78: op_pushdata4,
  79: op_1negate,
  81: op_1,
  82: op_2,
  83: op_3,
  84: op_4,
  85: op_5,
  86: op_6,
  87: op_7,
  88: op_8,
  89: op_9,
  90: op_10,
  91: op_11,
  92: op_12,
  93: op_13,
  94: op_14,
  95: op_15,
  96: op_16,
  97: op_nop,
  99: op_if,
  100: op_notif,
  103: op_else,
  104: op_endif,
  105: op_verify,
  106: op_return,
  107: op_toaltstack,
  108: op_fromaltstack,
  109: op_2drop,
  110: op_2dup,
  111: op_3dup,
  112: op_2over,
  113: op_2rot,
  114: op_2swap,
  115: op_ifdup,
  116: op_depth,
  117: op_drop,
  118: op_dup,
  119: op_nip,
  120: op_over,
  121: op_pick,
  122: op_roll,
  123: op_rot,
  124: op_swap,
  125: op_tuck,
  130: op_size,
  135: op_equal,
  136: op_equalverify,
  139: op_1add,
  140: op_1sub,
  143: op_negate,
  144: op_abs,
  145: op_not,
  146: op_0notequal,
  147: op_add,
  148: op_sub,
  149: op_mul,
  154: op_booland,
  155: op_boolor,
  156: op_numequal,
  157: op_numequalverify,
  158: op_numnotequal,
  159: op_lessthan,
  160: op_greaterthan,
  161: op_lessthanorequal,
  162: op_greaterthanorequal,
  163: op_min,
  164: op_max,
  165: op_within,
  166: op_ripemd160,
  167: op_sha1,
  168: op_sha256,
  169: op_hash160,
  170: op_hash256,
  172: op_checksig,
  173: op_checksigverify,
  174: op_checkmultisig,
  175: op_checkmultisigverify,
  176: op_nop,
  177: op_checklocktimeverify,
  178: op_checksequenceverify,
  179: op_nop,
  180: op_nop,
  181: op_nop,
  182: op_nop,
  183: op_nop,
  184: op_nop,
  185: op_nop,
};

function fillPushbyteNames() {
  const pushByteNames: Record<number, string> = {};
  for (let i = 1; i <= 75; i++) {
    pushByteNames[i] = `OP_PUSHBYTES_${i}`;
  }

  return pushByteNames;
}

export const OP_CODE_NAMES: Record<number, string> = {
  0: 'OP_0',
  ...fillPushbyteNames(),
  76: 'OP_PUSHDATA1',
  77: 'OP_PUSHDATA2',
  78: 'OP_PUSHDATA4',
  79: 'OP_1NEGATE',
  81: 'OP_1',
  82: 'OP_2',
  83: 'OP_3',
  84: 'OP_4',
  85: 'OP_5',
  86: 'OP_6',
  87: 'OP_7',
  88: 'OP_8',
  89: 'OP_9',
  90: 'OP_10',
  91: 'OP_11',
  92: 'OP_12',
  93: 'OP_13',
  94: 'OP_14',
  95: 'OP_15',
  96: 'OP_16',
  97: 'OP_NOP',
  99: 'OP_IF',
  100: 'OP_NOTIF',
  103: 'OP_ELSE',
  104: 'OP_ENDIF',
  105: 'OP_VERIFY',
  106: 'OP_RETURN',
  107: 'OP_TOALTSTACK',
  108: 'OP_FROMALTSTACK',
  109: 'OP_2DROP',
  110: 'OP_2DUP',
  111: 'OP_3DUP',
  112: 'OP_2OVER',
  113: 'OP_2ROT',
  114: 'OP_2SWAP',
  115: 'OP_IFDUP',
  116: 'OP_DEPTH',
  117: 'OP_DROP',
  118: 'OP_DUP',
  119: 'OP_NIP',
  120: 'OP_OVER',
  121: 'OP_PICK',
  122: 'OP_ROLL',
  123: 'OP_ROT',
  124: 'OP_SWAP',
  125: 'OP_TUCK',
  130: 'OP_SIZE',
  135: 'OP_EQUAL',
  136: 'OP_EQUALVERIFY',
  139: 'OP_1ADD',
  140: 'OP_1SUB',
  143: 'OP_NEGATE',
  144: 'OP_ABS',
  145: 'OP_NOT',
  146: 'OP_0NOTEQUAL',
  147: 'OP_ADD',
  148: 'OP_SUB',
  149: 'OP_MUL',
  154: 'OP_BOOLAND',
  155: 'OP_BOOLOR',
  156: 'OP_NUMEQUAL',
  157: 'OP_NUMEQUALVERIFY',
  158: 'OP_NUMNOTEQUAL',
  159: 'OP_LESSTHAN',
  160: 'OP_GREATERTHAN',
  161: 'OP_LESSTHANOREQUAL',
  162: 'OP_GREATERTHANOREQUAL',
  163: 'OP_MIN',
  164: 'OP_MAX',
  165: 'OP_WITHIN',
  166: 'OP_RIPEMD160',
  167: 'OP_SHA1',
  168: 'OP_SHA256',
  169: 'OP_HASH160',
  170: 'OP_HASH256',
  171: 'OP_CODESEPARATOR',
  172: 'OP_CHECKSIG',
  173: 'OP_CHECKSIGVERIFY',
  174: 'OP_CHECKMULTISIG',
  175: 'OP_CHECKMULTISIGVERIFY',
  176: 'OP_NOP1',
  177: 'OP_CHECKLOCKTIMEVERIFY',
  178: 'OP_CHECKSEQUENCEVERIFY',
  179: 'OP_NOP4',
  180: 'OP_NOP5',
  181: 'OP_NOP6',
  182: 'OP_NOP7',
  183: 'OP_NOP8',
  184: 'OP_NOP9',
  185: 'OP_NOP10',
};

// Reverse lookup of OP_CODE_NAMES
export const OP_CODES: Record<string, number> = Object.fromEntries(
  Object.entries(OP_CODE_NAMES).map(([key, value]) => [value, Number(key)])
);
