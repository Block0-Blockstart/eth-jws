"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCanonicalJson = void 0;
/**
 * Converts a JavaScript value to a JavaScript Object Notation (JSON) canonical string.
 * @see https://www.rfc-editor.org/rfc/rfc8785
 * @param obj A JavaScript value, usually an object or array, to be converted.
 * @return The canonical string or undefined.
 */
function toCanonicalJson(obj) {
    if (obj === null || ['undefined', 'boolean', 'number', 'string', 'bigint'].includes(typeof obj)) {
        return JSON.stringify(obj);
    }
    if (['function', 'symbol'].includes(typeof obj)) {
        return toCanonicalJson(undefined);
    }
    if (obj.toJSON instanceof Function) {
        return toCanonicalJson(obj.toJSON());
    }
    if (Array.isArray(obj)) {
        const values = obj.reduce((t, cv, ci) => {
            const comma = ci === 0 ? '' : ',';
            const value = cv === undefined || ['function', 'symbol'].includes(typeof cv) ? null : cv;
            return `${t}${comma}${toCanonicalJson(value)}`;
        }, '');
        return `[${values}]`;
    }
    const values = Object.keys(obj)
        .sort()
        .reduce((t, cv) => {
        if (obj[cv] === undefined || ['function', 'symbol'].includes(typeof obj[cv])) {
            return t;
        }
        const comma = t.length === 0 ? '' : ',';
        return `${t}${comma}${toCanonicalJson(cv)}:${toCanonicalJson(obj[cv])}`;
    }, '');
    return `{${values}}`;
}
exports.toCanonicalJson = toCanonicalJson;
//# sourceMappingURL=index.js.map