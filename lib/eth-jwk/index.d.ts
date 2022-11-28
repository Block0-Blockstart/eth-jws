export interface IPublicKeyJwk {
    kty: 'EC';
    crv: 'secp256k1';
    x: string;
    y: string;
}
/**
 * Computes a JWK containing an Ethereum public key, from a hex-encoded Ethereum uncompressed private key (with or without '0x' prefix).
 */
declare function hexPrivateKeyToJwkPublicKey(hexPrivateKey: string): IPublicKeyJwk;
/**
 * Computes a JWK containing an Ethereum public key, from a hex-encoded Ethereum uncompressed public key (with or without '0x' prefix).
 */
declare function hexPublicKeyToJwkPublicKey(hexPublicKey: string): IPublicKeyJwk;
/**
 * Converts a JWK containing an Ethereum public key to a hex-encoded Ethereum uncompressed public key ('0x' + 130 chars).
 */
declare function jwkPublicKeyToHexPublicKey(jwk: IPublicKeyJwk): string;
/**
 * Computes an Ethereum address from an JWK containing an Ethereum public key.
 */
declare function jwkPublicKeyToEthereumAddress(jwk: IPublicKeyJwk): string;
/**
 * Checks that a JWK contains the expected fields to represent an Ethereum public key
 */
declare function checkPublicJwkFormat(input: any): boolean;
/**
 * A set of tools allowing conversions of hex encoded Ethereum keys from/to standard JWKs.
 *
 * Currently, this supports only JWKs representing Ethereum public keys.
 */
export declare const ethJwk: {
    publicKey: {
        fromHexPrivateKey: typeof hexPrivateKeyToJwkPublicKey;
        fromHexPublicKey: typeof hexPublicKeyToJwkPublicKey;
        toHexPublicKey: typeof jwkPublicKeyToHexPublicKey;
        toEthereumAddress: typeof jwkPublicKeyToEthereumAddress;
        checkFormat: typeof checkPublicJwkFormat;
    };
};
export {};
//# sourceMappingURL=index.d.ts.map