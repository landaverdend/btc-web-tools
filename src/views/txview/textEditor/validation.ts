// src/crypto/transaction/validation.ts

import { FormattedTx, FormattedTxIn, FormattedTxOut } from '@/types/tx';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

const hasDuplicateKeys = (obj: any): boolean => {
  const seen = new Set<string>();
  for (const key in obj) {
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
};

const expectedTXKeys: (keyof FormattedTx)[] = ['version', 'inputs', 'outputs', 'locktime', 'witnesses', 'marker', 'flag'];
const requiredTXKeys: (keyof FormattedTx)[] = ['version', 'inputs', 'outputs', 'locktime'];
const expectedInputKeys: (keyof FormattedTxIn)[] = ['txid', 'vout', 'scriptSig', 'sequence'];

export const validateFormattedTx = (tx: any): tx is FormattedTx => {
  // First check if it's an object
  if (typeof tx !== 'object' || tx === null) {
    throw new ValidationError('Transaction must be an object');
  }

  // Check for dups at top level
  if (hasDuplicateKeys(tx)) {
    throw new ValidationError('Transaction contains duplicate keys');
  }

  // Get all keys from the object
  const keys = Object.keys(tx);

  // Check if it has exactly the expected keys
  if (keys.length < requiredTXKeys.length || !requiredTXKeys.every((key) => keys.includes(key))) {
    throw new ValidationError('Transaction must contain: version, inputs, outputs, and locktime');
  }

  // Validate the main structure
  if (
    typeof tx.version !== 'number' ||
    !Array.isArray(tx.inputs) ||
    !Array.isArray(tx.outputs) ||
    typeof tx.locktime !== 'number'
  ) {
    throw new ValidationError('Invalid transaction structure');
  }

  const validInputs = tx.inputs.every(isValidInput);
  const validOutputs = tx.outputs.every(isValidOutput);

  return validInputs && validOutputs;
};
// Validate inputs
const isValidInput = (input: any): boolean => {
  const inputKeys = Object.keys(input);

  if (hasDuplicateKeys(input)) {
    throw new ValidationError('Input contains duplicate keys');
  }

  // Check for exact keys in input
  if (inputKeys.length !== expectedInputKeys.length || !expectedInputKeys.every((key) => inputKeys.includes(key))) {
    throw new ValidationError('Input must have exactly: txid, vout, scriptSig, and sequence');
  }

  if (input.txid.length !== 64) {
    throw new ValidationError('Input txid must be 32 bytes');
  }

  return (
    typeof input.txid === 'string' &&
    typeof input.vout === 'number' &&
    typeof input.sequence === 'number' &&
    typeof input.scriptSig === 'object' &&
    input.scriptSig !== null &&
    Object.keys(input.scriptSig).length === 1 &&
    'cmds' in input.scriptSig &&
    Array.isArray(input.scriptSig.cmds)
  );
};

const expectedOutputKeys: (keyof FormattedTxOut)[] = ['amount', 'scriptPubkey'];

// Validate outputs
const isValidOutput = (output: any): boolean => {
  const outputKeys = Object.keys(output);

  if (hasDuplicateKeys(output)) {
    throw new ValidationError('Input contains duplicate keys');
  }

  // Check for exact keys in output
  if (outputKeys.length !== expectedOutputKeys.length || !expectedOutputKeys.every((key) => outputKeys.includes(key))) {
    throw new ValidationError('Output must have exactly: amount and scriptPubkey');
  }

  return (
    typeof output.amount === 'number' &&
    typeof output.scriptPubkey === 'object' &&
    output.scriptPubkey !== null &&
    Object.keys(output.scriptPubkey).length === 1 &&
    'cmds' in output.scriptPubkey &&
    Array.isArray(output.scriptPubkey.cmds)
  );
};


function validWitnessData() {
  
}