// src/crypto/transaction/validation.ts

import { FormattedTx } from '@/types/tx';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validateFormattedTx = (tx: any): tx is FormattedTx => {
  // First check if it's an object
  if (typeof tx !== 'object' || tx === null) {
    throw new ValidationError('Transaction must be an object');
  }

  // Get all keys from the object
  const keys = Object.keys(tx);

  // Check if it has exactly the expected keys
  const expectedKeys = ['version', 'inputs', 'outputs', 'locktime'];
  if (keys.length !== expectedKeys.length || !expectedKeys.every((key) => keys.includes(key))) {
    throw new ValidationError('Transaction must have exactly: version, inputs, outputs, and locktime');
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

  // Validate inputs
  const isValidInput = (input: any): boolean => {
    const inputKeys = Object.keys(input);
    const expectedInputKeys = ['prevTx', 'prevIndex', 'scriptSig', 'sequence'];

    // Check for exact keys in input
    if (inputKeys.length !== expectedInputKeys.length || !expectedInputKeys.every((key) => inputKeys.includes(key))) {
      throw new ValidationError('Input must have exactly: prevTx, prevIndex, scriptSig, and sequence');
    }

    return (
      typeof input.prevTx === 'string' &&
      typeof input.prevIndex === 'number' &&
      typeof input.sequence === 'number' &&
      typeof input.scriptSig === 'object' &&
      input.scriptSig !== null &&
      Object.keys(input.scriptSig).length === 1 &&
      'cmds' in input.scriptSig &&
      Array.isArray(input.scriptSig.cmds)
    );
  };

  // Validate outputs
  const isValidOutput = (output: any): boolean => {
    const outputKeys = Object.keys(output);
    const expectedOutputKeys = ['amount', 'scriptPubkey'];

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

  return tx.inputs.every(isValidInput) && tx.outputs.every(isValidOutput);
};
