import { sha256 } from '@noble/hashes/sha2.js';
import { ripemd160 } from '@noble/hashes/legacy.js';

function hash256(data: Uint8Array) {
  let hash = sha256(data);
  hash = sha256(hash);
  return new Uint8Array(hash);
}

function hash160(data: Uint8Array) {
  let hash = sha256(data);
  hash = ripemd160(hash);
  return new Uint8Array(hash);
}

export { hash256, hash160 };
