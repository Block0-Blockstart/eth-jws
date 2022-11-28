/**
 * Expected bytes length for private and public keys
 */
export declare enum KeyLen {
    ETHEREUM_PRIVATE_KEY = 32,
    ETHEREUM_PUBLIC_KEY = 65
}
/**
 * Converts a common hex string private key to u8a.
 */
export declare function keyToBytes(key: string | Uint8Array, keyLen: KeyLen): Uint8Array;
//# sourceMappingURL=index.d.ts.map