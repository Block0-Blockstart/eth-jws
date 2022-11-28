import { IPublicKeyJwk } from '../eth-jwk';
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
/**
 * u8a => base64url
 */
declare function bytesToBase64Url(input: Uint8Array): string;
/**
 * Computes the JWS payload by converting the raw payload to a canonical JSON, then to base64url.
 */
declare function encodePayload(payloadRaw: any): string;
/**
 * Computes the JWS header by converting the raw payload to a canonical JSON, then to base64url.
 */
declare function encodeHeader(headerRaw: IEthJwsHeader): string;
/**
 * Creates a JWS as a string, containing the concatenation of base64url(header) + '.' + base64url(payload) + '.' + base64url(signature)
 *
 * The header contains two props: alg and jwk. alg is 'ES256K' and jwk is the public key of the signer in jwk format.
 */
declare function create({ payload, privateKey }: {
    payload: any;
    privateKey: string;
}): string;
/**
 * Verifies a JWS signed with an Ethereum key.
 * If the public key is not provided, the verification is done with the public key contained in the jwk header.
 * This function will throw if the verification fails or is false.
 * Else it returns the decoded header and decoded payload.
 */
declare function verify(args: {
    jws: string;
    publicKey?: string;
}): {
    header: IEthJwsHeader;
    payload: any;
    publicKey: string;
};
declare function unpack(jws: string): IUnpackedEthJws;
export declare const ethJws: {
    create: typeof create;
    verify: typeof verify;
    utils: {
        encodePayload: typeof encodePayload;
        encodeHeader: typeof encodeHeader;
        bytesToBase64Url: typeof bytesToBase64Url;
        unpack: typeof unpack;
    };
};
export {};
//# sourceMappingURL=index.d.ts.map