import { Wallet } from '@ethersproject/wallet';
import { ethJws } from '.';
import { ethJwk } from '../eth-jwk';

describe('eth-jws', () => {
  let privK1: string;
  let pubK1: string;
  let privK2: string;

  beforeAll(() => {
    let w = Wallet.createRandom();
    privK1 = w.privateKey;
    pubK1 = w.publicKey;
    w = Wallet.createRandom();
    privK2 = w.privateKey;
  });

  describe('create', () => {
    it('should generate a result', () => {
      const payload = { a: 1, b: 2, c: 3 };
      const jws = ethJws.create({ payload, privateKey: privK1 });
      expect(jws).toBeDefined();
    });

    it('should generate the same results with the same payload and key', () => {
      const payload = { a: 1, b: 2, c: 3 };
      const jws1 = ethJws.create({ payload, privateKey: privK1 });
      const jws2 = ethJws.create({ payload, privateKey: privK1 });
      expect(jws1).toEqual(jws2);
    });

    it('should generate different results with different payloads', () => {
      const payload1 = { a: 1, b: 2, c: 3 };
      const payload2 = { a: 2, b: 3, c: 1 };
      const jws1 = ethJws.create({ payload: payload1, privateKey: privK1 });
      const jws2 = ethJws.create({ payload: payload2, privateKey: privK1 });
      expect(jws1).not.toEqual(jws2);
    });

    it('should generate different results with different signing keys', () => {
      const payload = { a: 1, b: 2, c: 3 };
      const jws1 = ethJws.create({ payload, privateKey: privK1 });
      const jws2 = ethJws.create({ payload, privateKey: privK2 });
      expect(jws1).not.toEqual(jws2);
    });

    it('should throw with a payload not parseable to JSON', () => {
      const payload = BigInt(123);
      expect(() => ethJws.create({ payload, privateKey: privK1 })).toThrow();
    });

    it('should throw with a payload that would be parsed to undefined', () => {
      const payload = undefined;
      expect(() => ethJws.create({ payload, privateKey: privK1 })).toThrow(
        'encodeAny(): input conversion to json results in null'
      );
    });
  });

  describe('verify', () => {
    it('should verify against given public key', () => {
      const inputPayload = { a: 1, b: 2, c: 3 };
      const jws = ethJws.create({ payload: inputPayload, privateKey: privK1 });
      const { header, payload, publicKey } = ethJws.verify({ jws, publicKey: pubK1 });
      expect(header).toBeDefined();
      expect(header).toEqual({ alg: 'ES256K', jwk: ethJwk.publicKey.fromHexPublicKey(pubK1) });
      expect(payload).toBeDefined();
      expect(payload).toEqual(inputPayload);
      expect(publicKey).toBe(pubK1);
    });

    it('should verify against jwk header public key', () => {
      const inputPayload = { a: 1, b: 2, c: 3 };
      const jws = ethJws.create({ payload: inputPayload, privateKey: privK1 });
      const { header, payload, publicKey } = ethJws.verify({ jws });
      expect(header).toBeDefined();
      expect(header).toEqual({ alg: 'ES256K', jwk: ethJwk.publicKey.fromHexPublicKey(pubK1) });
      expect(payload).toBeDefined();
      expect(payload).toEqual(inputPayload);
      expect(publicKey).toBe(pubK1);
    });

    it('should verify when the token header and payload are rebuild', async () => {
      const inputPayload = { a: 1, b: 2, c: 'Hello' };
      const jws = ethJws.create({ payload: inputPayload, privateKey: privK1 });

      // Rebuild header
      const headerRebuild = { alg: 'ES256K', jwk: ethJwk.publicKey.fromHexPublicKey(pubK1) };
      const headerRebuildB64 = ethJws.utils.encodeHeader(headerRebuild);
      // Rebuild payload
      const payloadRebuild = { c: 'Hello', b: 2, a: 1 };
      const payloadRebuildB64 = ethJws.utils.encodePayload(payloadRebuild);
      // extract signature from the jws
      const { sigB64 } = ethJws.utils.unpack(jws);
      // assemble a token with rebuild header, payload and extracted sig
      const tokenRecreated = headerRebuildB64 + '.' + payloadRebuildB64 + '.' + sigB64;

      // it should be valid
      const { header, payload, publicKey } = ethJws.verify({ jws: tokenRecreated });
      expect(header).toEqual(headerRebuild);
      expect(publicKey).toBe(pubK1);
      expect(payload).toEqual(inputPayload);
    });

    it('should throw on bad signature', async () => {
      const inputPayload = { a: 1, b: 2, c: 'Hello' };
      // The valid, original jws:
      const jws = ethJws.create({ payload: inputPayload, privateKey: privK1 });

      // Rebuild header
      const headerRebuild = { alg: 'ES256K', jwk: ethJwk.publicKey.fromHexPublicKey(pubK1) };
      const headerRebuildB64 = ethJws.utils.encodeHeader(headerRebuild);
      // Use another payload
      const fakePayload = { x: 'Hello', y: 2, z: 1 };
      const fakePayloadB64 = ethJws.utils.encodePayload(fakePayload);
      // Extract signature from the valid original jws
      const { sigB64 } = ethJws.utils.unpack(jws);
      // assemble a token with valid header, fake payload and sig extracted from the original
      const fakeToken = headerRebuildB64 + '.' + fakePayloadB64 + '.' + sigB64;

      // it should be invalid
      expect(() => ethJws.verify({ jws: fakeToken })).toThrow();
    });
  });

  describe('unpack', () => {
    it('should not throw on well-formed token', () => {
      const jws = ethJws.create({ payload: 'Hello', privateKey: privK1 });
      expect(() => ethJws.utils.unpack(jws)).not.toThrow();
      const res = ethJws.utils.unpack(jws);
      expect(res).toBeDefined();
    });

    it('should throw on malformed token', () => {
      // header
      const header = { alg: 'ES256K', jwk: ethJwk.publicKey.fromHexPublicKey(pubK1) };
      const headerB64 = ethJws.utils.encodeHeader(header);
      // payload
      const payload = 'Hello';
      const payloadB64 = ethJws.utils.encodePayload(payload);

      // it should be invalid
      expect(() => ethJws.utils.unpack('...')).toThrow();
      expect(() => ethJws.utils.unpack(headerB64)).toThrow();
      expect(() => ethJws.utils.unpack(headerB64 + '.')).toThrow();
      expect(() => ethJws.utils.unpack(headerB64 + '..')).toThrow();
      expect(() => ethJws.utils.unpack(headerB64 + '.' + payloadB64)).toThrow();
      expect(() => ethJws.utils.unpack(headerB64 + '.' + payloadB64 + '.')).toThrow();
      expect(() => ethJws.utils.unpack('.' + payloadB64 + '.')).toThrow();
      expect(() => ethJws.utils.unpack('.' + payloadB64 + '.' + 'abcd')).toThrow();
      expect(() => ethJws.utils.unpack(headerB64 + '.' + payloadB64 + '.' + '1234')).toThrow();
      expect(() => ethJws.utils.unpack(headerB64 + '.' + payloadB64 + '.' + 'abcd')).toThrow();
    });

    it('should throw on malformed token (bad header)', () => {
      const jws = ethJws.create({ payload: 'Hello', privateKey: privK1 });
      const { payloadB64, sigB64 } = ethJws.utils.unpack(jws);

      const header = { alg: 'ES256K', jwk: ethJwk.publicKey.fromHexPublicKey(pubK1) };
      const header1 = { alg: 'ES256K' };
      const header2 = { lol: 'ES256K', jwk: ethJwk.publicKey.fromHexPublicKey(pubK1) };
      const header3 = { alg: 'LOL', jwk: ethJwk.publicKey.fromHexPublicKey(pubK1) };

      const headerB64 = ethJws.utils.encodeHeader(header);
      const header1B64 = ethJws.utils.encodeHeader(header1 as any);
      const header2B64 = ethJws.utils.encodeHeader(header2 as any);
      const header3B64 = ethJws.utils.encodeHeader(header3 as any);

      expect(() => ethJws.utils.unpack(headerB64 + '.' + payloadB64 + '.' + sigB64)).not.toThrow();
      expect(() => ethJws.utils.unpack(header1B64 + '.' + payloadB64 + '.' + sigB64)).toThrow();
      expect(() => ethJws.utils.unpack(header2B64 + '.' + payloadB64 + '.' + sigB64)).toThrow();
      expect(() => ethJws.utils.unpack(header3B64 + '.' + payloadB64 + '.' + sigB64)).toThrow();
    });

    it('should throw on malformed token (bad sig)', () => {
      const jws = ethJws.create({ payload: 'Hello', privateKey: privK1 });
      const { headerB64, payloadB64, sigB64 } = ethJws.utils.unpack(jws);

      const badSigB64 = sigB64.substring(0, sigB64.length - 1);

      expect(() => ethJws.utils.unpack(headerB64 + '.' + payloadB64 + '.' + badSigB64)).toThrow();
    });

    it('should throw on malformed token (unparseable payload)', () => {
      const jws = ethJws.create({ payload: 'Hello', privateKey: privK1 });
      const { headerB64, sigB64 } = ethJws.utils.unpack(jws);

      expect(() => ethJws.utils.unpack(headerB64 + '.' + '13az1d' + '.' + sigB64)).toThrow();
    });
  });
});
