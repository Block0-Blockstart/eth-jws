import { KeyLen, encoders } from '.';
import { Wallet } from '@ethersproject/wallet';

describe('utils', () => {
  const obj1 = {
    raw: '{"a":1,"b":2,"c":3}',
    u8a: new Uint8Array([123, 34, 97, 34, 58, 49, 44, 34, 98, 34, 58, 50, 44, 34, 99, 34, 58, 51, 125]),
    b64url: 'eyJhIjoxLCJiIjoyLCJjIjozfQ',
    hex: '0x7b2261223a312c2262223a322c2263223a337d',
    b64: 'eyJhIjoxLCJiIjoyLCJjIjozfQ==',
  };

  const obj2 = {
    raw: '{"a":1,"b":"hello","c":"&@#()!{}:=+.?,/\\\\\'`\\""}',
    u8a: new Uint8Array([
      123, 34, 97, 34, 58, 49, 44, 34, 98, 34, 58, 34, 104, 101, 108, 108, 111, 34, 44, 34, 99, 34, 58, 34, 38, 64, 35,
      40, 41, 33, 123, 125, 58, 61, 43, 46, 63, 44, 47, 92, 92, 39, 96, 92, 34, 34, 125,
    ]),
    b64url: 'eyJhIjoxLCJiIjoiaGVsbG8iLCJjIjoiJkAjKCkhe306PSsuPywvXFwnYFwiIn0',
    hex: '0x7b2261223a312c2262223a2268656c6c6f222c2263223a222640232829217b7d3a3d2b2e3f2c2f5c5c27605c22227d',
    b64: 'eyJhIjoxLCJiIjoiaGVsbG8iLCJjIjoiJkAjKCkhe306PSsuPywvXFwnYFwiIn0=',
  };

  const obj3 = {
    raw: '{"a":1,"b":["hello",1,2,"good"],"c":"123"}',
    u8a: new Uint8Array([
      123, 34, 97, 34, 58, 49, 44, 34, 98, 34, 58, 91, 34, 104, 101, 108, 108, 111, 34, 44, 49, 44, 50, 44, 34, 103,
      111, 111, 100, 34, 93, 44, 34, 99, 34, 58, 34, 49, 50, 51, 34, 125,
    ]),
    b64url: 'eyJhIjoxLCJiIjpbImhlbGxvIiwxLDIsImdvb2QiXSwiYyI6IjEyMyJ9',
    hex: '0x7b2261223a312c2262223a5b2268656c6c6f222c312c322c22676f6f64225d2c2263223a22313233227d',
    b64: 'eyJhIjoxLCJiIjpbImhlbGxvIiwxLDIsImdvb2QiXSwiYyI6IjEyMyJ9',
  };

  const str1 = {
    raw: 'Jon Snow',
    u8a: new Uint8Array([74, 111, 110, 32, 83, 110, 111, 119]),
    b64url: 'Sm9uIFNub3c',
    hex: '0x4a6f6e20536e6f77',
    b64: 'Sm9uIFNub3c=',
  };

  const str2 = {
    raw: '&@#()!{}:=+.?,/\\\'`"',
    u8a: new Uint8Array([38, 64, 35, 40, 41, 33, 123, 125, 58, 61, 43, 46, 63, 44, 47, 92, 39, 96, 34]),
    b64url: 'JkAjKCkhe306PSsuPywvXCdgIg',
    hex: '0x2640232829217b7d3a3d2b2e3f2c2f5c276022',
    b64: 'JkAjKCkhe306PSsuPywvXCdgIg==',
  };

  const num1 = {
    raw: '123',
    u8a: new Uint8Array([49, 50, 51]),
    b64url: 'MTIz',
    hex: '0x313233',
    b64: 'MTIz',
  };

  const num2 = { raw: '0', u8a: new Uint8Array([48]), b64url: 'MA', hex: '0x30', b64: 'MA==' };

  let privK1: string;
  let pubK1: string;

  beforeAll(() => {
    const w = Wallet.createRandom();
    privK1 = w.privateKey;
    pubK1 = w.publicKey;
  });

  describe('encoders.string.to_u8a', () => {
    it('should encode u8a from serialized obj1', () =>
      expect(encoders.string.to_u8a(obj1.raw)).toEqual<Uint8Array>(obj1.u8a));
    it('should encode u8a from serialized obj2', () =>
      expect(encoders.string.to_u8a(obj2.raw)).toEqual<Uint8Array>(obj2.u8a));
    it('should encode u8a from serialized obj3', () =>
      expect(encoders.string.to_u8a(obj3.raw)).toEqual<Uint8Array>(obj3.u8a));
    it('should encode u8a from serialized str1', () =>
      expect(encoders.string.to_u8a(str1.raw)).toEqual<Uint8Array>(str1.u8a));
    it('should encode u8a from serialized str2', () =>
      expect(encoders.string.to_u8a(str2.raw)).toEqual<Uint8Array>(str2.u8a));
    it('should encode u8a from serialized num1', () =>
      expect(encoders.string.to_u8a(num1.raw)).toEqual<Uint8Array>(num1.u8a));
    it('should encode u8a from serialized num1', () =>
      expect(encoders.string.to_u8a(num2.raw)).toEqual<Uint8Array>(num2.u8a));
  });

  describe('encoders.u8a.to_b64url', () => {
    it('should encode base64url from u8a obj1', () => expect(encoders.u8a.to_b64url(obj1.u8a)).toEqual(obj1.b64url));
    it('should encode base64url from u8a obj2', () => expect(encoders.u8a.to_b64url(obj2.u8a)).toEqual(obj2.b64url));
    it('should encode base64url from u8a obj3', () => expect(encoders.u8a.to_b64url(obj3.u8a)).toEqual(obj3.b64url));
    it('should encode base64url from u8a str1', () => expect(encoders.u8a.to_b64url(str1.u8a)).toEqual(str1.b64url));
    it('should encode base64url from u8a str2', () => expect(encoders.u8a.to_b64url(str2.u8a)).toEqual(str2.b64url));
    it('should encode base64url from u8a num1', () => expect(encoders.u8a.to_b64url(num1.u8a)).toEqual(num1.b64url));
    it('should encode base64url from u8a num1', () => expect(encoders.u8a.to_b64url(num2.u8a)).toEqual(num2.b64url));
    it('should throw if not u8a', () =>
      expect(() => encoders.u8a.to_b64url(num2.raw as unknown as Uint8Array)).toThrow());
  });

  describe('encoders.u8a.to_string', () => {
    it('should decode string from u8a obj1', () => expect(encoders.u8a.to_string(obj1.u8a)).toEqual(obj1.raw));
    it('should decode string from u8a obj2', () => expect(encoders.u8a.to_string(obj2.u8a)).toEqual(obj2.raw));
    it('should decode string from u8a obj3', () => expect(encoders.u8a.to_string(obj3.u8a)).toEqual(obj3.raw));
    it('should decode string from u8a str1', () => expect(encoders.u8a.to_string(str1.u8a)).toEqual(str1.raw));
    it('should decode string from u8a str2', () => expect(encoders.u8a.to_string(str2.u8a)).toEqual(str2.raw));
    it('should decode string from u8a num1', () => expect(encoders.u8a.to_string(num1.u8a)).toEqual(num1.raw));
    it('should decode string from u8a num1', () => expect(encoders.u8a.to_string(num2.u8a)).toEqual(num2.raw));
    it('should throw if not u8a', () =>
      expect(() => encoders.u8a.to_string(num2.raw as unknown as Uint8Array)).toThrow());
  });

  describe('encoders.u8a.to_hex', () => {
    it('should encode hex from u8a obj1', () => expect(encoders.u8a.to_hex(obj1.u8a)).toEqual(obj1.hex));
    it('should encode hex from u8a obj2', () => expect(encoders.u8a.to_hex(obj2.u8a)).toEqual(obj2.hex));
    it('should encode hex from u8a obj3', () => expect(encoders.u8a.to_hex(obj3.u8a)).toEqual(obj3.hex));
    it('should encode hex from u8a str1', () => expect(encoders.u8a.to_hex(str1.u8a)).toEqual(str1.hex));
    it('should encode hex from u8a str2', () => expect(encoders.u8a.to_hex(str2.u8a)).toEqual(str2.hex));
    it('should encode hex from u8a num1', () => expect(encoders.u8a.to_hex(num1.u8a)).toEqual(num1.hex));
    it('should encode hex from u8a num1', () => expect(encoders.u8a.to_hex(num2.u8a)).toEqual(num2.hex));
    it('should throw if not u8a', () => expect(() => encoders.u8a.to_hex(num2.raw as unknown as Uint8Array)).toThrow());
  });

  describe('encoders.base64url.to_u8a', () => {
    it('should decode u8a from base64url obj1', () => expect(encoders.base64Url.to_u8a(obj1.b64url)).toEqual(obj1.u8a));
    it('should decode u8a from base64url obj2', () => expect(encoders.base64Url.to_u8a(obj2.b64url)).toEqual(obj2.u8a));
    it('should decode u8a from base64url obj3', () => expect(encoders.base64Url.to_u8a(obj3.b64url)).toEqual(obj3.u8a));
    it('should decode u8a from base64url str1', () => expect(encoders.base64Url.to_u8a(str1.b64url)).toEqual(str1.u8a));
    it('should decode u8a from base64url str2', () => expect(encoders.base64Url.to_u8a(str2.b64url)).toEqual(str2.u8a));
    it('should decode u8a from base64url num1', () => expect(encoders.base64Url.to_u8a(num1.b64url)).toEqual(num1.u8a));
    it('should decode u8a from base64url num1', () => expect(encoders.base64Url.to_u8a(num2.b64url)).toEqual(num2.u8a));
  });

  describe('encoders.base64.to_b64url', () => {
    it('should convert obj1 b64 to base64url', () =>
      expect(encoders.base64.to_base64url(obj1.b64)).toEqual(obj1.b64url));
    it('should convert obj2 b64 to base64url', () =>
      expect(encoders.base64.to_base64url(obj2.b64)).toEqual(obj2.b64url));
    it('should convert obj3 b64 to base64url', () =>
      expect(encoders.base64.to_base64url(obj3.b64)).toEqual(obj3.b64url));
    it('should convert str1 b64 to base64url', () =>
      expect(encoders.base64.to_base64url(str1.b64)).toEqual(str1.b64url));
    it('should convert str2 b64 to base64url', () =>
      expect(encoders.base64.to_base64url(str2.b64)).toEqual(str2.b64url));
    it('should convert num1 b64 to base64url', () =>
      expect(encoders.base64.to_base64url(num1.b64)).toEqual(num1.b64url));
    it('should convert num1 b64 to base64url', () =>
      expect(encoders.base64.to_base64url(num2.b64)).toEqual(num2.b64url));
  });

  describe('encoders.base64url.to_b64', () => {
    it('should decode b64 from base64url obj1', () =>
      expect(encoders.base64Url.to_base64(obj1.b64url)).toEqual(obj1.b64));
    it('should decode b64 from base64url obj2', () =>
      expect(encoders.base64Url.to_base64(obj2.b64url)).toEqual(obj2.b64));
    it('should decode b64 from base64url obj3', () =>
      expect(encoders.base64Url.to_base64(obj3.b64url)).toEqual(obj3.b64));
    it('should decode b64 from base64url str1', () =>
      expect(encoders.base64Url.to_base64(str1.b64url)).toEqual(str1.b64));
    it('should decode b64 from base64url str2', () =>
      expect(encoders.base64Url.to_base64(str2.b64url)).toEqual(str2.b64));
    it('should decode b64 from base64url num1', () =>
      expect(encoders.base64Url.to_base64(num1.b64url)).toEqual(num1.b64));
    it('should decode b64 from base64url num1', () =>
      expect(encoders.base64Url.to_base64(num2.b64url)).toEqual(num2.b64));
  });

  describe('encoders.ethereumKey.to_u8a', () => {
    it('should generate a result with valid private key', () =>
      expect(encoders.ethereumKey.to_u8a(privK1, KeyLen.ETHEREUM_PRIVATE_KEY)).toBeDefined());
    it('should generate a result with valid public key', () =>
      expect(encoders.ethereumKey.to_u8a(pubK1, KeyLen.ETHEREUM_PUBLIC_KEY)).toBeDefined());
    // hex priv key = '0x' + 64 char => 66 chars
    it('should throw with invalid private key length', () =>
      expect(() => encoders.ethereumKey.to_u8a(privK1.substring(0, 65), KeyLen.ETHEREUM_PRIVATE_KEY)).toThrow());
    // hex pub key = '0x' + 130 char => 132 chars
    it('should throw with invalid public key length', () =>
      expect(() => encoders.ethereumKey.to_u8a(pubK1.substring(0, 131), KeyLen.ETHEREUM_PUBLIC_KEY)).toThrow());
    it('should throw with invalid key format', () =>
      expect(() => encoders.ethereumKey.to_u8a(privK1.substring(0, 65) + 'P', KeyLen.ETHEREUM_PRIVATE_KEY)).toThrow());
    it('should generate a result with uprefixed key', () =>
      expect(encoders.ethereumKey.to_u8a(privK1.substring(2, 66), KeyLen.ETHEREUM_PRIVATE_KEY)).toBeDefined());
  });
});
