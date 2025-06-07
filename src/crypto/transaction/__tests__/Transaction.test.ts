import Tx from '../Transaction';

describe('Transaction', () => {
  test('should create a transaction instance', () => {
    const tx = new Tx();
    expect(tx).toBeDefined();
  });
}); 