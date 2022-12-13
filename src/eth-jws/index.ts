import { toCanonicalJson } from '../canonical-json';
import { keccak_256 } from '@noble/hashes/sha3';
import { signSync, utils, verify as secpVerify } from '@noble/secp256k1';
import { hmac } from '@noble/hashes/hmac';
import { sha256 } from '@noble/hashes/sha256';
import { encoders, KeyLen } from '../encoders';
import { IPublicKeyJwk, ethJwk } from '../eth-jwk';

utils.hmacSha256Sync = (key, ...msgs) => hmac(sha256, key, utils.concatBytes(...msgs));
/* istanbul ignore next */
utils.sha256Sync = (...msgs) => sha256(utils.concatBytes(...msgs));

export interface IEthJwsHeader {
  alg: string;
  jwk: IPublicKeyJwk;
  [propName: string]: unknown;
}

export interface IUnpackedEthJws {
  headerB64: string;
  header: IEthJwsHeader;
  payloadB64: string;
  payload: any;
  sigB64: string;
  sig: Uint8Array;
}

const ES256K = 'ES256K';

/**
 * input => canonical JSON => base64Url
 */
function encodeAny(input: any): string {
  const canonicalJson = toCanonicalJson(input);
  if (!canonicalJson) throw new Error('encodeAny(): input conversion to json results in null');
  const u8aCanonical = encoders.string.to_u8a(canonicalJson);
  return encoders.u8a.to_b64url(u8aCanonical);
}

/**
 * Computes the JWS payload by converting the raw payload to a canonical JSON, then to base64url.
 */
function encodePayload(payloadRaw: any): string {
  return encodeAny(payloadRaw);
}

/**
 * Computes the JWS header by converting the raw payload to a canonical JSON, then to base64url.
 */
function encodeHeader(headerRaw: IEthJwsHeader): string {
  return encodeAny(headerRaw);
}

function sign({
  payloadB64,
  headerB64,
  privateKey,
}: {
  payloadB64: string;
  headerB64: string;
  privateKey: Uint8Array;
}) {
  // ES256K alg = secp256k1(sha256(signaturePayload))
  // signature payload = an octet array (u8a) of concat(ASCII(BASE64URL(UTF8(JWS Protected Header)), '.', BASE64URL(JWS Payload))
  const signaturePayload = new TextEncoder().encode(headerB64 + '.' + payloadB64);
  // first step: hash
  const sha256Hash = keccak_256(signaturePayload);
  // second step: secp256k1
  // canonical: true means the signature will be compatible with libsecp256k1 and not compatible with openssl
  // recovered: false means that we don't get the recovery number (we no more use recoverable signatures in this lib)
  const bytesSig = signSync(sha256Hash, privateKey, { canonical: true, recovered: false, der: false });
  // final result is BASE64URL(JWS Signature)
  return encoders.u8a.to_b64url(bytesSig);
}

/**
 * Creates a JWS as a string, containing the concatenation of base64url(header) + '.' + base64url(payload) + '.' + base64url(signature)
 *
 * The header contains two props: alg and jwk. alg is 'ES256K' and jwk is the public key of the signer in jwk format.
 */
function create({ payload, privateKey }: { payload: any; privateKey: string }) {
  const header: IEthJwsHeader = { alg: ES256K, jwk: ethJwk.publicKey.fromHexPrivateKey(privateKey) };
  const headerB64 = encodeHeader(header);
  const payloadB64 = encodePayload(payload);
  const bytesKey = encoders.ethereumKey.to_u8a(privateKey, KeyLen.ETHEREUM_PRIVATE_KEY);
  const signatureB64 = sign({ payloadB64, headerB64, privateKey: bytesKey });
  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

/**
 * Verifies a JWS signed with an Ethereum key.
 * If the public key is not provided, the verification is done with the public key contained in the jwk header.
 * This function will throw if the verification fails or is false.
 * Else it returns the decoded header and decoded payload.
 */
function verify(args: { jws: string; publicKey?: string }) {
  const { headerB64, header, payloadB64, payload, sig } = unpack(args.jws);
  let publicKey = args.publicKey;
  if (!publicKey) publicKey = ethJwk.publicKey.toHexPublicKey(header.jwk);
  const bytesKey = encoders.ethereumKey.to_u8a(publicKey, KeyLen.ETHEREUM_PUBLIC_KEY);
  const sigPayload = new TextEncoder().encode(headerB64 + '.' + payloadB64);
  const sha256Hash = keccak_256(sigPayload);
  // strict: true means the signature is meant to be compatible with libsecp256k1
  // and not compatible with openssl (because we opt for canonical: true on signing options)
  const isValid = secpVerify(sig, sha256Hash, bytesKey, { strict: true });
  if (!isValid) throw new Error('Invalid JWS: signature verification returned false.');

  return { header, payload, publicKey };
}

function unpack(jws: string): IUnpackedEthJws {
  const { 0: headerB64, 1: payloadB64, 2: sigB64, length } = jws.split('.');

  if (length !== 3) throw new Error('Invalid JWS: malformed.');
  if (headerB64 === undefined) throw new Error('Invalid JWS: missing header.');
  if (typeof headerB64 !== 'string') throw new Error('Invalid JWS: bad header type.');
  if (payloadB64 === undefined) throw new Error('Invalid JWS: missing payload.');
  if (typeof payloadB64 !== 'string') throw new Error('Invalid JWS: bad payload type.');
  if (sigB64 === undefined) throw new Error('Invalid JWS: missing signature.');
  if (typeof sigB64 !== 'string') throw new Error('Invalid JWS: bad signature type.');

  let header: IEthJwsHeader;

  try {
    const u8aHeader = encoders.base64Url.to_u8a(headerB64);
    const parsed = JSON.parse(new TextDecoder().decode(u8aHeader));
    if (Object.keys(parsed).length < 2) throw new Error();
    if (parsed.alg !== ES256K) throw new Error();
    if (!parsed.jwk || !ethJwk.publicKey.checkFormat(parsed.jwk)) throw new Error();
    header = parsed;
  } catch (e) {
    throw new Error('Invalid JWS: invalid header.');
  }

  const sig = encoders.base64Url.to_u8a(sigB64);
  if (sig.length !== 64) throw new Error('Invalid JWS: bad signature length.');

  let payload: any;
  try {
    payload = JSON.parse(encoders.u8a.to_string(encoders.base64Url.to_u8a(payloadB64)));
  } catch (e) {
    throw new Error('Invalid JWS: payload is not supported by JWS spec.');
  }

  return { headerB64, header, payloadB64, payload, sigB64, sig };
}

/**
 * @deprecated
 * Use encoders.u8a.to_b64url() instead.
 */
const bytesToBase64Url = encoders.u8a.to_b64url;

export const ethJws = {
  create,
  verify,
  utils: {
    encodePayload,
    encodeHeader,
    unpack,
    bytesToBase64Url,
  },
};
