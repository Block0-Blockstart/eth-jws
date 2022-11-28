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

v 1.0.0 Tests coverage


File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
--------------------|---------|----------|---------|---------|-------------------
All files           |   89.39 |    81.25 |   86.36 |   96.46 |                   
 src                |       0 |      100 |       0 |       0 |                   
  index.ts          |       0 |      100 |       0 |       0 | 1-4               
 src/canonical-json |     100 |      100 |     100 |     100 |                   
  index.ts          |     100 |      100 |     100 |     100 |                   
 src/eth-jwk        |     100 |      100 |     100 |     100 |                   
  index.ts          |     100 |      100 |     100 |     100 |                   
 src/eth-jws        |   87.83 |       50 |      90 |    98.3 |                   
  index.ts          |   87.83 |       50 |      90 |    98.3 | 34                
 src/utils          |    90.9 |    66.66 |     100 |     100 |                   
  index.ts          |    90.9 |    66.66 |     100 |     100 | 17



## Contact
**block0**
+ info@block0.io
+ [https://block0.io/](https://block0.io/)

## License
This repository is released under the [MIT License](https://opensource.org/licenses/MIT).