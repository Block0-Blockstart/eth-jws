import { arrayify } from '@ethersproject/bytes';

/**
 * Expected bytes length for private and public keys
 */
export enum KeyLen {
  ETHEREUM_PRIVATE_KEY = 32,
  ETHEREUM_PUBLIC_KEY = 65,
}

/**
 * Converts a common hex string private key to u8a.
 */
export function keyToBytes(key: string | Uint8Array, keyLen: KeyLen) {
  try {
    const res = arrayify(key, { allowMissingPrefix: true });
    if (res.length !== keyLen) throw new Error();
    return res;
  } catch (e) {
    //catch both arrayify errors and length error
    throw new Error('Invalid key');
  }
}
