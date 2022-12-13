"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ethJwk = void 0;
const utils_1 = require("@noble/hashes/utils");
const wallet_1 = require("@ethersproject/wallet");
const encoders_1 = require("../encoders");
const transactions_1 = require("@ethersproject/transactions");
/**
 * Computes a JWK containing an Ethereum public key, from a hex-encoded Ethereum uncompressed private key (with or without '0x' prefix).
 */
function hexPrivateKeyToJwkPublicKey(hexPrivateKey) {
    return hexPublicKeyToJwkPublicKey(new wallet_1.Wallet(hexPrivateKey).publicKey);
}
/**
 * Computes a JWK containing an Ethereum public key, from a hex-encoded Ethereum uncompressed public key (with or without '0x' prefix).
 */
function hexPublicKeyToJwkPublicKey(hexPublicKey) {
    const pubK = encoders_1.encoders.ethereumKey.to_u8a(hexPublicKey, encoders_1.KeyLen.ETHEREUM_PUBLIC_KEY);
    const header = pubK[0];
    // the first byte is always 0x04, which means the key is uncompressed, with 32 bytes x and 32 bytes y
    if (header !== 0x04)
        throw new Error('hexPublicKeyToJws: expected 65 bytes with header byte = 0x04');
    const x = pubK.subarray(1, 33); // skip byte 0 which is the header
    const y = pubK.subarray(33, 65);
    return {
        kty: 'EC',
        crv: 'secp256k1',
        x: encoders_1.encoders.u8a.to_b64url(x),
        y: encoders_1.encoders.u8a.to_b64url(y),
    };
}
/**
 * Converts a JWK containing an Ethereum public key to a hex-encoded Ethereum uncompressed public key ('0x' + 130 chars).
 */
function jwkPublicKeyToHexPublicKey(jwk) {
    if (!checkPublicJwkFormat(jwk))
        throw new Error('Invalid JWK');
    const x = encoders_1.encoders.base64Url.to_u8a(jwk.x);
    const y = encoders_1.encoders.base64Url.to_u8a(jwk.y);
    const header = new Uint8Array([0x04]);
    const flattened = (0, utils_1.concatBytes)(header, x, y);
    return encoders_1.encoders.u8a.to_hex(flattened);
}
/**
 * Computes an Ethereum address from an JWK containing an Ethereum public key.
 */
function jwkPublicKeyToEthereumAddress(jwk) {
    return (0, transactions_1.computeAddress)(jwkPublicKeyToHexPublicKey(jwk));
}
/**
 * Checks that a JWK contains the expected fields to represent an Ethereum public key
 */
function checkPublicJwkFormat(input) {
    if (!input ||
        !input.kty ||
        input.kty !== 'EC' ||
        !input.crv ||
        input.crv !== 'secp256k1' ||
        !input.x ||
        typeof input.x !== 'string' ||
        !input.y ||
        typeof input.y !== 'string') {
        return false;
    }
    return true;
}
/**
 * A set of tools allowing conversions of hex encoded Ethereum keys from/to standard JWKs.
 *
 * Currently, this supports only JWKs representing Ethereum public keys.
 */
exports.ethJwk = {
    publicKey: {
        fromHexPrivateKey: hexPrivateKeyToJwkPublicKey,
        fromHexPublicKey: hexPublicKeyToJwkPublicKey,
        toHexPublicKey: jwkPublicKeyToHexPublicKey,
        toEthereumAddress: jwkPublicKeyToEthereumAddress,
        checkFormat: checkPublicJwkFormat,
    },
};
//# sourceMappingURL=index.js.map