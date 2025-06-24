// Mock for @noble/secp256k1
export const verify = jest.fn((signature: Uint8Array, message: Uint8Array, publicKey: Uint8Array): boolean => {
  // For testing purposes, return true for valid-looking signatures
  // This is a simplified mock - in real usage you'd want more sophisticated validation
  return signature.length > 0 && message.length > 0 && publicKey.length > 0;
});

export const sign = jest.fn((message: Uint8Array, privateKey: Uint8Array): Uint8Array => {
  // Mock signature - return a dummy signature
  return new Uint8Array(64); // 64 bytes for a typical ECDSA signature
});

export const getPublicKey = jest.fn((privateKey: Uint8Array): Uint8Array => {
  // Mock public key derivation
  return new Uint8Array(33); // 33 bytes for compressed public key
});

// Export other commonly used functions as needed
export const CURVE = {
  n: BigInt('0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141'),
  P: BigInt('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f'),
};

export const utils = {
  randomPrivateKey: jest.fn((): Uint8Array => {
    return new Uint8Array(32);
  }),
};

export const Point = class {
  constructor() {}
  static fromHex(hex: string) {
    return new Point();
  }
};

export const Signature = class {
  constructor() {}
  static fromHex(hex: string) {
    return new Signature();
  }
};
