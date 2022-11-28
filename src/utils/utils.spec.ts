import { KeyLen, keyToBytes } from '.';
import { Wallet } from '@ethersproject/wallet';

describe('utils', () => {
  let privK1: string;
  let pubK1: string;

  beforeAll(() => {
    const w = Wallet.createRandom();
    privK1 = w.privateKey;
    pubK1 = w.publicKey;
  });

  describe('keyToBytes', () => {
    it('should generate a result with valid private key', () => {
      const r1 = keyToBytes(privK1, KeyLen.ETHEREUM_PRIVATE_KEY);
      expect(r1).toBeDefined();
    });

    it('should generate a result with valid public key', () => {
      const r1 = keyToBytes(pubK1, KeyLen.ETHEREUM_PUBLIC_KEY);
      expect(r1).toBeDefined();
    });

    it('should throw with invalid private key length', () => {
      // hex priv key = '0x' + 64 char => 66 chars
      expect(() => keyToBytes(privK1.substring(0, 65), KeyLen.ETHEREUM_PRIVATE_KEY)).toThrow();
    });

    it('should throw with invalid public key length', () => {
      // hex pub key = '0x' + 130 char => 132 chars
      expect(() => keyToBytes(pubK1.substring(0, 131), KeyLen.ETHEREUM_PUBLIC_KEY)).toThrow();
    });

    it('should throw with invalid key format', () => {
      expect(() => keyToBytes(privK1.substring(0, 65) + 'P', KeyLen.ETHEREUM_PRIVATE_KEY)).toThrow();
    });

    it('should generate a result with uprefixed key', () => {
      const r1 = keyToBytes(privK1.substring(2, 66), KeyLen.ETHEREUM_PRIVATE_KEY);
      expect(r1).toBeDefined();
    });
  });
});
