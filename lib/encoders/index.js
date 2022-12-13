"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encoders = exports.KeyLen = void 0;
const bytes_1 = require("@ethersproject/bytes");
const base64_1 = require("@ethersproject/base64");
/**
 * Expected bytes length for private and public keys
 */
var KeyLen;
(function (KeyLen) {
    KeyLen[KeyLen["ETHEREUM_PRIVATE_KEY"] = 32] = "ETHEREUM_PRIVATE_KEY";
    KeyLen[KeyLen["ETHEREUM_PUBLIC_KEY"] = 65] = "ETHEREUM_PUBLIC_KEY";
})(KeyLen = exports.KeyLen || (exports.KeyLen = {}));
/**
 * Converts a common hex string Ethereum key to u8a.
 */
function keyToU8a(key, keyLen) {
    try {
        const res = (0, bytes_1.arrayify)(key, { allowMissingPrefix: true });
        if (res.length !== keyLen)
            throw new Error();
        return res;
    }
    catch (e) {
        //catch both arrayify errors and length error
        throw new Error('Invalid key');
    }
}
function b64ToB64url(b64) {
    return b64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
/**
 * The second argument (padding) is true by default.
 * When true, the result will use the optional padding to ensure that the result represent a multiple of 4 bytes.
 */
function b64urlToB64(b64url, padding = true) {
    // base64 algorithm allows to pad the ending byte with 0's.
    // This padding will result in one or two "=" chars at the end, once the bytes are converted to chars.
    // This padding is optional, but recommended: the goal is to ensure that the final output is always a multiple of 4 bytes.
    // But the base64url algo never uses padding.
    // So, reversing from base64url to base64 can be achieved in two ways:
    // - either we use a simple replace and we don't care about the padding.
    // - or we recreate the optional padding
    const noPadding = b64url.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
    return padding ? (0, base64_1.encode)((0, base64_1.decode)(noPadding)) : noPadding;
}
function u8aToB64url(u8a) {
    if (!(u8a instanceof Uint8Array)) {
        throw new Error('u8aToB64url() requires a u8a as input.');
    }
    // For info, old version for nodeJS only, not supported by browser
    // return Buffer.from(u8a).toString('base64url');
    return b64ToB64url((0, base64_1.encode)(u8a));
}
function b64urlToU8a(b64url) {
    // For info, old version for nodeJS only, not supported by browser
    // return Buffer.from(b64url, 'base64url');
    return (0, base64_1.decode)(b64urlToB64(b64url, false));
}
function u8aToHex(u8a) {
    if (!(u8a instanceof Uint8Array)) {
        throw new Error('u8aToHex() requires a u8a as input.');
    }
    // For info, old version for nodeJS only, not supported by browser
    // return '0x' + Buffer.from(u8a).toString('hex');
    return (0, bytes_1.hexlify)(u8a);
}
function u8aToString(u8a) {
    return new TextDecoder().decode(u8a);
}
function stringToU8a(str) {
    return new TextEncoder().encode(str + '');
}
/**
 NOTE: 1) from payload to final base64url encoded:
 object => parse to string via canonicalJson => encode string to u8a => encode u8a to b64 => convert b64 to b64url

 NOTE: 2) from final base64url encoded to payload:
 convert b64url to b64 => decode b64 to u8a => decode u8a to string => parse string to object using JSON.parse
*/
exports.encoders = {
    base64: {
        to_base64url: b64ToB64url,
    },
    base64Url: {
        to_base64: b64urlToB64,
        to_u8a: b64urlToU8a,
    },
    u8a: {
        to_b64url: u8aToB64url,
        to_hex: u8aToHex,
        to_string: u8aToString,
    },
    string: {
        to_u8a: stringToU8a,
    },
    ethereumKey: {
        to_u8a: keyToU8a,
    },
};
//# sourceMappingURL=index.js.map