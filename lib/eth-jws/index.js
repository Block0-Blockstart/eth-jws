"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ethJws = void 0;
const canonical_json_1 = require("../canonical-json");
const sha3_1 = require("@noble/hashes/sha3");
const secp256k1_1 = require("@noble/secp256k1");
const hmac_1 = require("@noble/hashes/hmac");
const sha256_1 = require("@noble/hashes/sha256");
const utils_1 = require("../utils");
const eth_jwk_1 = require("../eth-jwk");
secp256k1_1.utils.hmacSha256Sync = (key, ...msgs) => (0, hmac_1.hmac)(sha256_1.sha256, key, secp256k1_1.utils.concatBytes(...msgs));
secp256k1_1.utils.sha256Sync = (...msgs) => (0, sha256_1.sha256)(secp256k1_1.utils.concatBytes(...msgs));
const ES256K = 'ES256K';
/**
 * u8a => base64url
 */
function bytesToBase64Url(input) {
    if (!(input instanceof Uint8Array)) {
        throw new Error('bytesToBase64Url() requires a u8a as input.');
    }
    return Buffer.from(input).toString('base64url');
}
/**
 * input => canonical JSON => base64Url
 */
function encodeAny(input) {
    const u8aCanonical = new TextEncoder().encode((0, canonical_json_1.toCanonicalJson)(input));
    return bytesToBase64Url(u8aCanonical);
}
/**
 * Computes the JWS payload by converting the raw payload to a canonical JSON, then to base64url.
 */
function encodePayload(payloadRaw) {
    return encodeAny(payloadRaw);
}
/**
 * Computes the JWS header by converting the raw payload to a canonical JSON, then to base64url.
 */
function encodeHeader(headerRaw) {
    return encodeAny(headerRaw);
}
function sign({ payloadB64, headerB64, privateKey, }) {
    // ES256K alg = secp256k1(sha256(signaturePayload))
    // signature payload = an octet array (u8a) of concat(ASCII(BASE64URL(UTF8(JWS Protected Header)), '.', BASE64URL(JWS Payload))
    const signaturePayload = new TextEncoder().encode(headerB64 + '.' + payloadB64);
    // first step: hash
    const sha256Hash = (0, sha3_1.keccak_256)(signaturePayload);
    // second step: secp256k1
    // canonical: true means the signature will be compatible with libsecp256k1 and not compatible with openssl
    // recovered: false means that we don't get the recovery number (we no more use recoverable signatures in this lib)
    const bytesSig = (0, secp256k1_1.signSync)(sha256Hash, privateKey, { canonical: true, recovered: false, der: false });
    // final result is BASE64URL(JWS Signature)
    return bytesToBase64Url(bytesSig);
}
/**
 * Creates a JWS as a string, containing the concatenation of base64url(header) + '.' + base64url(payload) + '.' + base64url(signature)
 *
 * The header contains two props: alg and jwk. alg is 'ES256K' and jwk is the public key of the signer in jwk format.
 */
function create({ payload, privateKey }) {
    const header = { alg: ES256K, jwk: eth_jwk_1.ethJwk.publicKey.fromHexPrivateKey(privateKey) };
    const headerB64 = encodeHeader(header);
    const payloadB64 = encodePayload(payload);
    const bytesKey = (0, utils_1.keyToBytes)(privateKey, utils_1.KeyLen.ETHEREUM_PRIVATE_KEY);
    const signatureB64 = sign({ payloadB64, headerB64, privateKey: bytesKey });
    return `${headerB64}.${payloadB64}.${signatureB64}`;
}
/**
 * Verifies a JWS signed with an Ethereum key.
 * If the public key is not provided, the verification is done with the public key contained in the jwk header.
 * This function will throw if the verification fails or is false.
 * Else it returns the decoded header and decoded payload.
 */
function verify(args) {
    const { headerB64, header, payloadB64, payload, sig } = unpack(args.jws);
    let publicKey = args.publicKey;
    if (!publicKey)
        publicKey = eth_jwk_1.ethJwk.publicKey.toHexPublicKey(header.jwk);
    const bytesKey = (0, utils_1.keyToBytes)(publicKey, utils_1.KeyLen.ETHEREUM_PUBLIC_KEY);
    const sigPayload = new TextEncoder().encode(headerB64 + '.' + payloadB64);
    const sha256Hash = (0, sha3_1.keccak_256)(sigPayload);
    // strict: true means the signature is meant to be compatible with libsecp256k1
    // and not compatible with openssl (because we opt for canonical: true on signing options)
    const isValid = (0, secp256k1_1.verify)(sig, sha256Hash, bytesKey, { strict: true });
    if (!isValid)
        throw new Error('Invalid JWS: signature verification returned false.');
    return { header, payload, publicKey };
}
function unpack(jws) {
    const { 0: headerB64, 1: payloadB64, 2: sigB64, length } = jws.split('.');
    if (length !== 3)
        throw new Error('Invalid JWS: malformed.');
    if (headerB64 === undefined)
        throw new Error('Invalid JWS: missing header.');
    if (typeof headerB64 !== 'string')
        throw new Error('Invalid JWS: bad header type.');
    if (payloadB64 === undefined)
        throw new Error('Invalid JWS: missing payload.');
    if (typeof payloadB64 !== 'string')
        throw new Error('Invalid JWS: bad payload type.');
    if (sigB64 === undefined)
        throw new Error('Invalid JWS: missing signature.');
    if (typeof sigB64 !== 'string')
        throw new Error('Invalid JWS: bad signature type.');
    let header;
    try {
        const u8aHeader = Buffer.from(headerB64, 'base64url');
        const parsed = JSON.parse(new TextDecoder().decode(u8aHeader));
        if (Object.keys(parsed).length < 2)
            throw new Error();
        if (parsed.alg !== ES256K)
            throw new Error();
        if (!parsed.jwk || !eth_jwk_1.ethJwk.publicKey.checkFormat(parsed.jwk))
            throw new Error();
        header = parsed;
    }
    catch (e) {
        throw new Error('Invalid JWS: invalid header.');
    }
    const sig = Buffer.from(sigB64, 'base64url');
    if (sig.length !== 64)
        throw new Error('Invalid JWS: bad signature length.');
    let payload;
    try {
        payload = JSON.parse(new TextDecoder().decode(Buffer.from(payloadB64, 'base64url')));
    }
    catch (e) {
        throw new Error('Invalid JWS: payload is not supported by JWS spec.');
    }
    return { headerB64, header, payloadB64, payload, sigB64, sig };
}
exports.ethJws = {
    create,
    verify,
    utils: {
        encodePayload,
        encodeHeader,
        bytesToBase64Url,
        unpack,
    },
};
//# sourceMappingURL=index.js.map