import { concatBytes } from '@noble/hashes/utils';
import { Wallet } from '@ethersproject/wallet';
import { KeyLen, keyToBytes } from '../utils';
import { computeAddress } from '@ethersproject/transactions';

/* 
JSON Web Key (JWK) : https://www.rfc-editor.org/rfc/rfc7517#section-4
JSON Web Algorithms (JWA): https://www.rfc-editor.org/rfc/rfc7518.html#section-6.2
JSON Object Signing and Encryption (JOSE) Registrations for Web Authentication (WebAuthn) Algorithms : https://www.rfc-editor.org/rfc/rfc8812.html

x and y are curve point coordinates, each represented as the base64url encoding of the octet string representation of this coordinate,
as defined in Section 2.3.5 of SEC1 (http://www.secg.org/sec1-v2.pdf)
x = r = left part of the compact hex public key
y = s = right part of the compact hex public key

For a private key, we would add d (base64url encoding of the octet string representation of v, the private key) 
*/

export interface IPublicKeyJwk {
  kty: 'EC';
  crv: 'secp256k1';
  x: string;
  y: string;
}

/**
 * Computes a JWK containing an Ethereum public key, from a hex-encoded Ethereum uncompressed private key (with or without '0x' prefix).
 */
function hexPrivateKeyToJwkPublicKey(hexPrivateKey: string): IPublicKeyJwk {
  return hexPublicKeyToJwkPublicKey(new Wallet(hexPrivateKey).publicKey);
}

/**
 * Computes a JWK containing an Ethereum public key, from a hex-encoded Ethereum uncompressed public key (with or without '0x' prefix).
 */
function hexPublicKeyToJwkPublicKey(hexPublicKey: string): IPublicKeyJwk {
  const pubK = keyToBytes(hexPublicKey, KeyLen.ETHEREUM_PUBLIC_KEY);
  const header = pubK[0];
  // the first byte is always 0x04, which means the key is uncompressed, with 32 bytes x and 32 bytes y
  if (header !== 0x04) throw new Error('hexPublicKeyToJws: expected 65 bytes with header byte = 0x04');
  const x = pubK.subarray(1, 33); // skip byte 0 which is the header
  const y = pubK.subarray(33, 65);

  return {
    kty: 'EC',
    crv: 'secp256k1',
    x: Buffer.from(x).toString('base64url'),
    y: Buffer.from(y).toString('base64url'),
  };
}

/**
 * Converts a JWK containing an Ethereum public key to a hex-encoded Ethereum uncompressed public key ('0x' + 130 chars).
 */
function jwkPublicKeyToHexPublicKey(jwk: IPublicKeyJwk): string {
  if (!checkPublicJwkFormat(jwk)) throw new Error('Invalid JWK');
  const x = Buffer.from(jwk.x, 'base64url');
  const y = Buffer.from(jwk.y, 'base64url');
  const header = new Uint8Array([0x04]);
  const flattened = Buffer.from(concatBytes(header, x, y));
  return '0x' + flattened.toString('hex');
}

/**
 * Computes an Ethereum address from an JWK containing an Ethereum public key.
 */
function jwkPublicKeyToEthereumAddress(jwk: IPublicKeyJwk): string {
  return computeAddress(jwkPublicKeyToHexPublicKey(jwk));
}

/**
 * Checks that a JWK contains the expected fields to represent an Ethereum public key
 */
function checkPublicJwkFormat(input: any): boolean {
  if (
    !input ||
    !input.kty ||
    input.kty !== 'EC' ||
    !input.crv ||
    input.crv !== 'secp256k1' ||
    !input.x ||
    typeof input.x !== 'string' ||
    !input.y ||
    typeof input.y !== 'string'
  ) {
    return false;
  }
  return true;
}

/**
 * A set of tools allowing conversions of hex encoded Ethereum keys from/to standard JWKs.
 *
 * Currently, this supports only JWKs representing Ethereum public keys.
 */
export const ethJwk = {
  publicKey: {
    fromHexPrivateKey: hexPrivateKeyToJwkPublicKey,
    fromHexPublicKey: hexPublicKeyToJwkPublicKey,
    toHexPublicKey: jwkPublicKeyToHexPublicKey,
    toEthereumAddress: jwkPublicKeyToEthereumAddress,
    checkFormat: checkPublicJwkFormat,
  },
};
