import * as bitcoin from 'bitcoinjs-lib';
import { TxMetadata, Vin } from '@/api/api';
import { bytesToHex } from './helper';

/**
 * Detects the scriptpubkey_type from a raw output script.
 *
 * Script patterns:
 * - P2PKH: OP_DUP OP_HASH160 <20 bytes> OP_EQUALVERIFY OP_CHECKSIG (25 bytes)
 * - P2SH: OP_HASH160 <20 bytes> OP_EQUAL (23 bytes)
 * - P2WPKH: OP_0 <20 bytes> (22 bytes)
 * - P2WSH: OP_0 <32 bytes> (34 bytes)
 * - P2TR: OP_1 <32 bytes> (34 bytes)
 * - P2PK: <33 or 65 bytes pubkey> OP_CHECKSIG
 */
export function detectScriptType(script: Uint8Array): string {
  const len = script.length;

  // P2PKH: OP_DUP (0x76) OP_HASH160 (0xa9) 0x14 <20 bytes> OP_EQUALVERIFY (0x88) OP_CHECKSIG (0xac)
  if (len === 25 && script[0] === 0x76 && script[1] === 0xa9 && script[2] === 0x14 && script[23] === 0x88 && script[24] === 0xac) {
    return 'p2pkh';
  }

  // P2SH: OP_HASH160 (0xa9) 0x14 <20 bytes> OP_EQUAL (0x87)
  if (len === 23 && script[0] === 0xa9 && script[1] === 0x14 && script[22] === 0x87) {
    return 'p2sh';
  }

  // P2WPKH: OP_0 (0x00) 0x14 <20 bytes> (native segwit v0)
  if (len === 22 && script[0] === 0x00 && script[1] === 0x14) {
    return 'v0_p2wpkh';
  }

  // P2WSH: OP_0 (0x00) 0x20 <32 bytes> (native segwit v0)
  if (len === 34 && script[0] === 0x00 && script[1] === 0x20) {
    return 'v0_p2wsh';
  }

  // P2TR: OP_1 (0x51) 0x20 <32 bytes> (taproot v1)
  if (len === 34 && script[0] === 0x51 && script[1] === 0x20) {
    return 'v1_p2tr';
  }

  // P2PK: <33 bytes compressed pubkey> OP_CHECKSIG or <65 bytes uncompressed> OP_CHECKSIG
  if ((len === 35 && script[0] === 0x21 && script[34] === 0xac) ||
    (len === 67 && script[0] === 0x41 && script[66] === 0xac)) {
    return 'p2pk';
  }

  return 'unknown';
}

/**
 * Converts a script to ASM format (human-readable opcodes).
 * Simple implementation - just shows hex for data pushes.
 */
function scriptToAsm(script: Uint8Array): string {
  // For now, just return hex - could be expanded to show opcodes
  return bytesToHex(new Uint8Array(script));
}

/**
 * Builds TxMetadata from a bitcoinjs-lib Transaction and its parent transactions.
 *
 * @param tx - The main transaction (bitcoinjs-lib Transaction)
 * @param parents - Map of parent txid -> bitcoinjs-lib Transaction
 * @returns TxMetadata object compatible with the existing API types
 */
export function buildTxMetadata(
  tx: bitcoin.Transaction,
  parents: Record<string, bitcoin.Transaction>
): TxMetadata {
  const txid = tx.getId();

  // Build vin array
  const vin: Vin[] = tx.ins.map((input) => {
    // Reverse the hash bytes (Bitcoin stores txids in little-endian) and convert to hex
    const hashBytes = new Uint8Array(input.hash);
    const reversedHash = new Uint8Array(hashBytes).reverse();
    const prevTxId = bytesToHex(reversedHash);
    const prevVout = input.index;
    const parentTx = parents[prevTxId];

    // Check if this is a coinbase transaction (all zeros txid)
    const isCoinbase = prevTxId === '0000000000000000000000000000000000000000000000000000000000000000';

    let prevout: Vin['prevout'] = undefined;

    if (!isCoinbase && parentTx) {
      const parentOutput = parentTx.outs[prevVout];
      if (parentOutput) {
        const scriptBytes = new Uint8Array(parentOutput.script);
        const scriptpubkey = bytesToHex(scriptBytes);
        const scriptpubkey_type = detectScriptType(scriptBytes);

        prevout = {
          scriptpubkey,
          scriptpubkey_asm: scriptToAsm(scriptBytes),
          scriptpubkey_type,
          value: Number(parentOutput.value),
        };
      }
    }

    const inputScriptBytes = new Uint8Array(input.script);
    return {
      txid: prevTxId,
      vout: prevVout,
      prevout,
      scriptsig: bytesToHex(inputScriptBytes),
      scriptsig_asm: scriptToAsm(inputScriptBytes),
      is_coinbase: isCoinbase,
      sequence: input.sequence,
    };
  });

  // Build vout array
  const vout = tx.outs.map((output) => {
    const scriptBytes = new Uint8Array(output.script);
    const scriptpubkey = bytesToHex(scriptBytes);
    const scriptpubkey_type = detectScriptType(scriptBytes);

    return {
      scriptpubkey,
      scriptpubkey_asm: scriptToAsm(scriptBytes),
      scriptpubkey_type,
      value: Number(output.value),
    };
  });

  // Calculate weight
  const weight = tx.weight();

  return {
    txid,
    version: tx.version,
    locktime: tx.locktime,
    vin,
    vout,
    size: tx.byteLength(),
    weight,
    fee: 0, // Can't calculate without knowing input values (would need to sum prevout values - output values)
    status: {
      confirmed: true, // We don't have this info from Electrum
      block_height: 0,
      block_hash: '',
      block_time: 0,
    },
  };
}
