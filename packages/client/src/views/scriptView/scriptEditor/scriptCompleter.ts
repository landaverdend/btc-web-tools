import { Ace } from 'ace-builds';

// Define common Bitcoin Script operations with descriptions
const scriptOperations = [
  {
    name: 'OP_ADD',
    value: 'OP_ADD',
    score: 1000,
    meta: 'opcode',
    description: 'Pop two items and push their sum',
  },
  {
    name: 'OP_SUB',
    value: 'OP_SUB',
    score: 1000,
    meta: 'opcode',
    description: 'Pop two items and push their difference',
  },
  {
    name: 'OP_MUL',
    value: 'OP_MUL',
    score: 1000,
    meta: 'opcode',
    description: 'Pop two items and push their product',
  },
  {
    name: 'OP_EQUAL',
    value: 'OP_EQUAL',
    score: 1000,
    meta: 'opcode',
    description: 'Pop two items and push 1 if they are equal, 0 otherwise',
  },
  {
    name: 'OP_VERIFY',
    value: 'OP_VERIFY',
    score: 1000,
    meta: 'opcode',
    description: 'Pop one item and verify it is true',
  },
  {
    name: 'OP_DUP',
    value: 'OP_DUP',
    score: 1000,
    meta: 'opcode',
    description: 'Duplicate the top item on the stack',
  },
  {
    name: 'OP_HASH160',
    value: 'OP_HASH160',
    score: 1000,
    meta: 'opcode',
    description: 'Hash the top item with RIPEMD160(SHA256())',
  },
  {
    name: 'OP_CHECKSIG',
    value: 'OP_CHECKSIG',
    score: 1000,
    meta: 'opcode',
    description: 'Pop public key and signature, verify signature. Requires a transaction to be fetched.',
  },
  {
    name: 'OP_CHECKMULTISIG',
    value: 'OP_CHECKMULTISIG',
    score: 1000,
    meta: 'opcode',
    description: 'Pop multiple public keys and signatures, verify signatures. Requires a transaction to be fetched.',
  },
  {
    name: 'OP_IF',
    value: 'OP_IF',
    score: 1000,
    meta: 'opcode',
    description: 'Pop one item and if it is true, execute the next opcode',
  },
  {
    name: 'OP_ELSE',
    value: 'OP_ELSE',
    score: 900,
    meta: 'opcode',
    description: 'ELSE clause',
  },
  {
    name: 'OP_ENDIF',
    value: 'OP_ENDIF',
    score: 900,
    meta: 'opcode',
    description: 'End the if statement',
  },
];

// fill in the op_codes 0-16
for (let i = 0; i < 17; i++) {
  scriptOperations.push({
    name: `OP_${i}`,
    value: `OP_${i}`,
    score: 500,
    meta: 'opcode',
    description: `Push the number ${i} onto the stack`,
  });
}

for (let i = 1; i <= 75; i++) {
  scriptOperations.push({
    name: `OP_PUSHBYTES_${i}`,
    value: `OP_PUSHBYTES_${i}`,
    score: 300 - i,
    meta: 'opcode',
    description: `Push ${i} bytes onto the stack`,
  });
}

export const scriptCompleter: Ace.Completer = {
  getCompletions: (editor: any, session: any, pos: any, prefix: string, callback: Function) => {
    // Only show completions when typing
    if (prefix.length === 0) {
      callback(null, []);
      return;
    }

    // Filter operations that match the current prefix
    const matches = scriptOperations.filter((op) => op.name.toLowerCase().startsWith(prefix.toLowerCase()));

    // Convert matches to Ace completion format
    const completions = matches.map((op) => ({
      caption: op.name,
      value: op.value,
      meta: op.meta,
      score: op.score,
      docText: op.description,
    }));

    callback(null, completions);
  },
};
