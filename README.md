# eth-jws

This lib provides tools to create and verify JSON Web Signatures (JWS) that use Ethereum private keys to sign payloads. 

Generated JWS are compliant with the JWS spec (https://www.rfc-editor.org/rfc/rfc7515).

## Lib specifications

* We use JWS Compact Serialization:
```
concat(BASE64URL(UTF8(JWS Protected Header)), '.', BASE64URL(JWS Payload), '.', BASE64URL(JWS Signature))
```

* The JWS Payload is canonicalized before being encoded as Base64Url. This ensures that the same payload can be rebuild from the same raw JS object. 

For example, these raw payloads will result in the same encoded payload (this would not work using JSON.stringify): 
```
// js object raw payload
{
  a: 12,
  b: 34,
  c: 56,
}

// another js object raw payload
{
  c: 56,
  b: 34,
  a: 12,  
}
```

* We use a JOSE ECDSA signature with secp256k1 curve. The algorithm is registered as ES256K. The spec is here: https://www.rfc-editor.org/rfc/rfc8812.html

The signature payload is:
``` 
concat(ASCII(BASE64URL(UTF8(JWS Protected Header)), '.', BASE64URL(JWS Payload))
``` 

* We always include the signer public as a JWK in the JWS header.

The JWS header contains these fields and only these fields:
```
'alg': 'ES256K'                
'jwk': the JWK representing the public key of the signer
```

The JWK always has these fields and only these fields:
```
{
 kty: 'EC',
 crv: 'secp256k1',
 x: the x coord,
 y: the y coord,
};
```

## How to use

### Installation
```bash
npm i https://github.com/Block0-Blockstart/eth-jws
```

### Create a JWS with Ethereum signature
```
ethJws.create(args: {
    payload: any;
    privateKey: string;
}): string
```

### Verify a JWS signed with this lib
```
ethJws.function verify(args: {
    jws: string;
    publicKey?: string;
}): {
    header: IEthJwsHeader;
    payload: any;
    publicKey: string;
}
```
 * If the public key is not provided, the verification is done with the public key contained in the jwk header.
 * This function will throw if the verification fails or is false.
 * Else it returns the decoded header, the decoded payload and the hex-encoded Ethereum public key.

### Other features

#### ethJws.utils.bytesToBase64Url(input:Uint8Array): string
Converts u8a => base64url               
**@deprecated**: use encoders.u8a.to_b64url() instead.

#### ethJws.utils.encodeHeader(headerRaw:IEthJwsHeader): string
Computes the JWS header by converting the raw payload to a canonical JSON, then to base64url.

#### ethJws.utils.encodePayload(payloadRaw:any): string
Computes the JWS payload by converting the raw payload to a canonical JSON, then to base64url.

#### ethJws.utils.unpack(jws:string): IUnpackedEthJws
Tries to decode a jws.

#### ethJwk.publicKey.checkFormat(input: any): boolean
Checks that a JWK contains the expected fields to represent an Ethereum public key

#### ethJwk.publicKey.fromHexPrivateKey(hexPrivateKey: string): IPublicKeyJwk
Computes a JWK containing an Ethereum public key, from a hex-encoded Ethereum uncompressed private key (with or without '0x' prefix).

#### ethJwk.publicKey.fromHexPublicKey(hexPublicKey: string): IPublicKeyJwk
Computes a JWK containing an Ethereum public key, from a hex-encoded Ethereum uncompressed public key (with or without '0x' prefix).

#### ethJwk.publicKey.toHexPublicKey(jwk: IPublicKeyJwk): string
Converts a JWK containing an Ethereum public key to a hex-encoded Ethereum uncompressed public key ('0x' + 130 chars).

#### ethJwk.publicKey.toEthereumAddress(jwk: IPublicKeyJwk): string
Computes an Ethereum address from an JWK containing an Ethereum public key.

#### encoders.base64.to_base64url(b64: string): string
Converts base64 to base64url.

#### encoders.base64Url.to_base64(b64url: string, padding = true): string
Converts base64url to base64. Second argument (padding) is true by default. When true, the result will always represent a multiple of 4 bytes.

#### encoders.base64Url.to_u8a(b64url: string): Uint8Array
Decodes base64url to Uint8Array.

#### encoders.u8a.to_b64url(u8a: Uint8Array): string
Encodes Uint8Array to base64url.

#### encoders.u8a.to_hex(u8a: Uint8Array): string
Converts Uint8Array to hex string.

#### encoders.u8a.to_string(u8a: Uint8Array): string
Converts Uint8Array (representing an utf-8 string) to string.

#### encoders.string.to_u8a(str: string): Uint8Array
Converts a string to Uint8Array.

#### encoders.ethereumKey.to_u8a(key: string | Uint8Array, keyLen: KeyLen): Uint8Array
Converts a common hex string key to Uint8Array. keyLen indicates the expected bytes for the key.
A common Ethereum private key is 32 bytes long, while an Ethereum public key is 65 bytes long.

## Commands for lib contributors

* Build the lib
```
npm run build
```
Don't forget to build any new release, as users install directly from this repo.


* Lint
```
npm run lint
```

* Testing
```
npm run test
npm run test:watch // launch tests in watch mode
npm run test:cov // launch tests coverage
```

**v1.1.0 test coverage is > 90%.**

## Contact
**block0**
+ info@block0.io
+ [https://block0.io/](https://block0.io/)

## License
This repository is released under the [MIT License](https://opensource.org/licenses/MIT).