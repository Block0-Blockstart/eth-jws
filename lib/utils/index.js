"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyToBytes = exports.KeyLen = void 0;
const bytes_1 = require("@ethersproject/bytes");
/**
 * Expected bytes length for private and public keys
 */
var KeyLen;
(function (KeyLen) {
    KeyLen[KeyLen["ETHEREUM_PRIVATE_KEY"] = 32] = "ETHEREUM_PRIVATE_KEY";
    KeyLen[KeyLen["ETHEREUM_PUBLIC_KEY"] = 65] = "ETHEREUM_PUBLIC_KEY";
})(KeyLen = exports.KeyLen || (exports.KeyLen = {}));
/**
 * Converts a common hex string private key to u8a.
 */
function keyToBytes(key, keyLen) {
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
exports.keyToBytes = keyToBytes;
//# sourceMappingURL=index.js.map