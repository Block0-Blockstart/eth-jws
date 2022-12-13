/**
 * Expected bytes length for private and public keys
 */
export declare enum KeyLen {
    ETHEREUM_PRIVATE_KEY = 32,
    ETHEREUM_PUBLIC_KEY = 65
}
/**
 * Converts a common hex string Ethereum key to u8a.
 */
declare function keyToU8a(key: string | Uint8Array, keyLen: KeyLen): Uint8Array;
declare function b64ToB64url(b64: string): string;
/**
 * The second argument (padding) is true by default.
 * When true, the result will use the optional padding to ensure that the result represent a multiple of 4 bytes.
 */
declare function b64urlToB64(b64url: string, padding?: boolean): string;
declare function u8aToB64url(u8a: Uint8Array): string;
declare function b64urlToU8a(b64url: string): Uint8Array;
declare function u8aToHex(u8a: Uint8Array): string;
declare function u8aToString(u8a: Uint8Array): string;
declare function stringToU8a(str: string): Uint8Array;
/**
 NOTE: 1) from payload to final base64url encoded:
 object => parse to string via canonicalJson => encode string to u8a => encode u8a to b64 => convert b64 to b64url

 NOTE: 2) from final base64url encoded to payload:
 convert b64url to b64 => decode b64 to u8a => decode u8a to string => parse string to object using JSON.parse
*/
export declare const encoders: {
    base64: {
        to_base64url: typeof b64ToB64url;
    };
    base64Url: {
        to_base64: typeof b64urlToB64;
        to_u8a: typeof b64urlToU8a;
    };
    u8a: {
        to_b64url: typeof u8aToB64url;
        to_hex: typeof u8aToHex;
        to_string: typeof u8aToString;
    };
    string: {
        to_u8a: typeof stringToU8a;
    };
    ethereumKey: {
        to_u8a: typeof keyToU8a;
    };
};
export {};
//# sourceMappingURL=index.d.ts.map