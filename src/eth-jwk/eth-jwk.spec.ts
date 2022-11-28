import { Wallet } from '@ethersproject/wallet';
import { ethJwk } from '.';

describe('eth-jwk', () => {
  const privK1 = '0x9d530df23e45df9ab421f4dcafa3a60f234b58ac9ab829b1e3cb26130bfeada9';
  const pubK1 =
    '0x04b089e366c29f918af7f4a75205d62f1f9b92a83014cae0cd570c9dc0897cbc6cc8f67d8505df3c54c38749091a6512b2ae60fafce70c14ef4780f9a70d9d4c2a';
  const x1 = 'sInjZsKfkYr39KdSBdYvH5uSqDAUyuDNVwydwIl8vGw';
  const y1 = 'yPZ9hQXfPFTDh0kJGmUSsq5g-vznDBTvR4D5pw2dTCo';
  const invalidPubK1 =
  '0x03b089e366c29f918af7f4a75205d62f1f9b92a83014cae0cd570c9dc0897cbc6cc8f67d8505df3c54c38749091a6512b2ae60fafce70c14ef4780f9a70d9d4c2a';

  describe('fromHexPublicKey', () => {
    it('should generate a result with valid public key', () => {
      const pubK = Wallet.createRandom().publicKey;
      const res = ethJwk.publicKey.fromHexPublicKey(pubK);
      expect(res).toBeDefined();
    });

    it('should generate a valid result with valid public key', () => {
      const res = ethJwk.publicKey.fromHexPublicKey(pubK1);
      expect(res).toEqual({ kty: 'EC', crv: 'secp256k1', x: x1, y: y1 });
    });
  
    it('should throw with invalid public key header byte', () => {
      expect(() => ethJwk.publicKey.fromHexPublicKey(invalidPubK1)).toThrow();
    });  
  });

  describe('fromHexPrivateKey', () => {
    it('should generate a valid result with valid private key', () => {
      const res = ethJwk.publicKey.fromHexPrivateKey(privK1);
      expect(res).toEqual({ kty: 'EC', crv: 'secp256k1', x: x1, y: y1 });
    });

    it('should generate the same jwk with private key or public key', () => {
      const res1 = ethJwk.publicKey.fromHexPublicKey(pubK1);
      const res2 = ethJwk.publicKey.fromHexPrivateKey(privK1);
      expect(res1).toEqual(res2);
    });  
  });

  describe('toHexPublicKey', () => {
    it('should reverse jwk to public key', () => {
      const res = ethJwk.publicKey.toHexPublicKey({ kty: 'EC', crv: 'secp256k1', x: x1, y: y1 });
      expect(res).toEqual(pubK1);
    });

    it('should throw on malformed jwk', () => {
      expect(() => ethJwk.publicKey.toHexPublicKey({ kty: 'RSA', crv: 'secp256k1', x: x1, y: y1 } as any)).toThrow();
    });  

    it('should encode than reverse many times', () => {
      const pubks = [];
      const jwks = [];
      const n = 5;
  
      for (let i = 0; i < n; i++) {
        const k = Wallet.createRandom().publicKey;
        pubks.push(k);
        jwks.push(ethJwk.publicKey.fromHexPublicKey(k));
      }
  
      for (let i = 0; i < n; i++) {
        const r = ethJwk.publicKey.toHexPublicKey(jwks[i]);
        expect(r).toEqual(pubks[i]);
      }
    });
  });

  describe('toEthereumAddress', () => {
    it('should reverse jwk to valid ethereum address', () => {
      const { publicKey, address } = Wallet.createRandom();
      const jwk = ethJwk.publicKey.fromHexPublicKey(publicKey);
      const reversedAddress = ethJwk.publicKey.toEthereumAddress(jwk);
      expect(reversedAddress).toBe(address);
    });
  });
 
  describe('checkFormat', () => {
    it('should return false', () => {
      const res = ethJwk.publicKey.checkFormat({ kty: 'EC', crv: 'secp256k1', x: x1, y: y1 });
      expect(res).toBe(true);
    });

    it('should return false', () => {
      const res = ethJwk.publicKey.checkFormat({ kty: 'RSA', crv: 'secp256k1', x: x1, y: y1 });
      expect(res).toBe(false);
    });
  });
});
