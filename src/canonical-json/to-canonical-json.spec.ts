/* eslint-disable @typescript-eslint/no-empty-function */
import { toCanonicalJson } from '.';

describe('toCanonicalJson', () => {
  describe('should behave like JSON.stringify()', () => {
    describe('Null and Undefined', () => {
      it('Undefined', () => expect(toCanonicalJson(undefined)).toEqual(JSON.stringify(undefined)));

      it('Null', () => expect(toCanonicalJson(null)).toEqual(JSON.stringify(null)));
    });

    describe('Boolean', () => {
      it('true', () => expect(toCanonicalJson(true)).toEqual(JSON.stringify(true)));

      it('false', () => expect(toCanonicalJson(false)).toEqual(JSON.stringify(false)));
    });

    describe('Number', () => {
      it('int', () => expect(toCanonicalJson(69)).toEqual(JSON.stringify(69)));

      it('NaN', () => expect(toCanonicalJson(NaN)).toEqual(JSON.stringify(NaN)));

      it('Infinity', () => expect(toCanonicalJson(Infinity)).toEqual(JSON.stringify(Infinity)));

      it('large integer', () => expect(toCanonicalJson(Math.pow(2, 1000))).toEqual(JSON.stringify(Math.pow(2, 1000))));
    });

    describe('BigInt', () => {
      it('should throw', () => {
        const bi = BigInt(9007199254740991);
        expect(() => JSON.stringify(bi)).toThrow();
        expect(() => toCanonicalJson(bi)).toThrow();
      });
    });

    describe('String', () => {
      it('common', () => expect(toCanonicalJson('foo')).toEqual(JSON.stringify('foo')));

      it('number as string', () => expect(toCanonicalJson('1')).toEqual(JSON.stringify('1')));

      it('unicode code point', () => expect(toCanonicalJson('\u20ac')).toEqual(JSON.stringify('\u20ac'))); //"€"

      it('unicode strings, control chars, lone surrogates', () => {
        expect(toCanonicalJson('\uD800')).toEqual(JSON.stringify('\uD800')); // "\\ud800"
        expect(toCanonicalJson('\uDEAD')).toEqual(JSON.stringify('\uDEAD')); // "\\udead"
        expect(toCanonicalJson('\u0008')).toEqual(JSON.stringify('\u0008')); // "\\b"
        expect(toCanonicalJson('\u0009')).toEqual(JSON.stringify('\u0009')); // "\\t"
        expect(toCanonicalJson('\u000A')).toEqual(JSON.stringify('\u000A')); // "\\n"
        expect(toCanonicalJson('\u000C')).toEqual(JSON.stringify('\u000C')); // "\\f"
        expect(toCanonicalJson('\u000D')).toEqual(JSON.stringify('\u000D')); // "\\r"
        expect(toCanonicalJson('\u005C')).toEqual(JSON.stringify('\u005C')); // "\\\\"
        expect(toCanonicalJson('\u0022')).toEqual(JSON.stringify('\u0022')); // "\\""
      });
    });

    describe('Symbol', () => {
      it('as a single value', () =>
        expect(toCanonicalJson(Symbol('Jane Doe'))).toEqual(JSON.stringify(Symbol('Jane Doe'))));

      it('as value in key-value object', () => {
        const obj = { x: undefined, y: Object, z: Symbol('') };
        expect(toCanonicalJson(obj)).toEqual(JSON.stringify(obj)); // '{}'
      });

      it('as key in key-value object', () => {
        const obj = { [Symbol('foo')]: 'foo' };
        expect(toCanonicalJson(obj)).toEqual(JSON.stringify(obj)); // '{}'
      });

      it('Symbol.for used as value in key-value object', () => {
        const obj = { z: [Symbol.for('foo')] };
        expect(toCanonicalJson(obj)).toEqual(JSON.stringify(obj)); // '{}'
      });

      it('Symbol.for used as key in key-value object', () => {
        const obj = { [Symbol.for('foo')]: 'foo' };
        expect(toCanonicalJson(obj)).toEqual(JSON.stringify(obj)); // '{}'
      });

      it('Symbol.for used as an array element', () => {
        const obj = [[Symbol.for('foo')]];
        expect(toCanonicalJson(obj)).toEqual(JSON.stringify(obj)); // '[null]'
      });
    });

    describe('Function', () => {
      it('void return', () => expect(toCanonicalJson(() => {})).toEqual(JSON.stringify(() => {})));

      it('returning something', () => expect(toCanonicalJson(() => 'a')).toEqual(JSON.stringify(() => 'a')));

      it('class implementing toJSON()', () => {
        // Date implements toJSON(), that's why it works
        const input = new Date(Date.UTC(2006, 0, 2, 15, 4, 5));
        expect(toCanonicalJson(input)).toEqual(JSON.stringify(input)); //"2006-01-02T15:04:05.000Z"
      });

      // this will not be true if the contructor takes b, then a as params
      // we support canonic ordering, but JSON.stringify does not. See specific tests below.
      it('class NOT implementing toJSON()', () => {
        class Foo {
          constructor(private a: number, private b: number) {}
          add() {
            return this.a + this.b;
          }
        }
        const f = new Foo(123, 456);
        expect(toCanonicalJson(f)).toEqual(JSON.stringify(f)); // '{"a":123,"b":456}'
      });
    });

    describe('Array object', () => {
      it('mix of types', () => {
        const a = [undefined, null, true, false, 'foo', 42, BigInt(42).toString(), Symbol('hello'), () => {}];
        expect(toCanonicalJson(a)).toEqual(JSON.stringify(a)); // '[null,null,true,false,"foo",42,"42",null,null]'
      });

      it('with string keys', () => {
        const a: any = ['foo', 'bar'];
        a['baz'] = 'quux';
        // a includes [ 0: 'foo', 1: 'bar', baz: 'quux' ] but JSON ignores string key
        expect(toCanonicalJson(a)).toEqual(JSON.stringify(a)); // '["foo","bar"]'
      });

      it('int TypedArray', () => {
        const a = [new Int8Array([1]), new Int16Array([1]), new Int32Array([1])];
        expect(toCanonicalJson(a)).toEqual(JSON.stringify(a)); //'[{"0":1},{"0":1},{"0":1}]'
      });

      it('uint TypedArray', () => {
        const a = [new Uint8Array([1]), new Uint8ClampedArray([1]), new Uint16Array([1]), new Uint32Array([1])];
        expect(toCanonicalJson(a)).toEqual(JSON.stringify(a)); // '[{"0":1},{"0":1},{"0":1},{"0":1}]'
      });

      it('float32 TypedArray', () => {
        const a = [new Float32Array([1]), new Float64Array([1])];
        expect(toCanonicalJson(a)).toEqual(JSON.stringify(a)); // '[{"0":1},{"0":1}]'
      });

      it('empty', () => expect(toCanonicalJson([])).toEqual(JSON.stringify([]))); //'[]'

      it('single element', () => {
        expect(toCanonicalJson(['abc'])).toEqual(JSON.stringify(['abc'])); // '["abc"]'}
        expect(toCanonicalJson([123])).toEqual(JSON.stringify([123])); // '[123]'
        expect(toCanonicalJson([true])).toEqual(JSON.stringify([true])); // '[true]'
        expect(toCanonicalJson([false])).toEqual(JSON.stringify([false])); // '[false]'
        expect(toCanonicalJson([null])).toEqual(JSON.stringify([null])); // '[null]'
        expect(toCanonicalJson([undefined])).toEqual(JSON.stringify([undefined])); // '[null]' !!
        expect(toCanonicalJson([Symbol('hello world')])).toEqual(JSON.stringify([Symbol('hello world')])); // '[null]' !!
        expect(toCanonicalJson([() => {}])).toEqual(JSON.stringify([() => {}])); // '[null]' !!
      });

      it('nested array', () => expect(toCanonicalJson([['b', 'a']])).toEqual(JSON.stringify([['b', 'a']]))); // '[["b","a"]]'

      // this will not be true if the object keys are inverted
      // we support canonic ordering, but JSON.stringify does not. See specific tests below.
      it('an object in an array', () => {
        const a = [{ a: 123, b: 'string' }];
        expect(toCanonicalJson(a)).toEqual(JSON.stringify(a)); // '[{"a":123,"b":"string"}]'
      });
    });

    describe('key-value object', () => {
      it('empty object', () => expect(toCanonicalJson({})).toEqual(JSON.stringify({}))); // '{}'

      it('string key', () => expect(toCanonicalJson({ a: 'b' })).toEqual(JSON.stringify({ a: 'b' }))); // '{"a":"b"}'

      it('number key', () => expect(toCanonicalJson({ 8: 'b' })).toEqual(JSON.stringify({ 8: 'b' }))); // '{"8":"b"}'

      it('symbol key', () =>
        expect(toCanonicalJson({ [Symbol('foo')]: 'bar' })).toEqual(JSON.stringify({ [Symbol('foo')]: 'bar' }))); //'{}'

      it('null value', () => expect(toCanonicalJson({ a: null })).toEqual(JSON.stringify({ a: null }))); //'{"a":null}'

      it('undefined value', () => expect(toCanonicalJson({ a: undefined })).toEqual(JSON.stringify({ a: undefined }))); // '{}'

      it('symbol value', () => expect(toCanonicalJson({ a: Symbol('b') })).toEqual(JSON.stringify({ a: Symbol('b') }))); // '{}'

      it('object value', () => expect(toCanonicalJson({ a: { b: 'c' } })).toEqual(JSON.stringify({ a: { b: 'c' } }))); //'{"a":{"b":"c"}}'

      it('array value', () => expect(toCanonicalJson({ a: [1, 2] })).toEqual(JSON.stringify({ a: [1, 2] }))); //'{"a":[1,2]}'

      it('function value', () => expect(toCanonicalJson({ a: () => {} })).toEqual(JSON.stringify({ a: () => {} }))); // '{}'

      it('mix of types among values', () => {
        const obj = {
          big: BigInt(42).toString(),
          f: false,
          fun: () => {},
          n: null,
          num: 42,
          s: 'string',
          sym: Symbol('hello'),
          t: true,
          u: undefined,
        };
        expect(toCanonicalJson(obj)).toEqual(JSON.stringify(obj)); // '{"big":"42","f":false,"n":null,"num":42,"s":"string","t":true}'
      });

      it('non-enumerable properties', () => {
        const obj = Object.create(null, { x: { value: 'x', enumerable: false }, y: { value: 'y', enumerable: true } });
        expect(toCanonicalJson(obj)).toEqual(JSON.stringify(obj)); // '{"y":"y"}'
      });

      it('implementing toJSON()', () => {
        const obj = { a: 'x', b: 'y', toJSON: () => ({ res: 'res' }) };
        expect(JSON.stringify(obj)).toEqual('{"res":"res"}');
        expect(toCanonicalJson(obj)).toEqual(JSON.stringify(obj)); // '{"res":"res"}'
      });
    });

    describe('key-value Set, Map and other data structures not implementing toJSON()', () => {
      test('standard data structures', () => {
        const s = new Set([1]);
        const m = new Map([[1, 2]]);
        const ws = new WeakSet([{ a: 1 }]);
        const wm = new WeakMap([[{ a: 1 }, 2]]);
        expect(toCanonicalJson(s)).toEqual(JSON.stringify(s)); // '{}'
        expect(toCanonicalJson(m)).toEqual(JSON.stringify(m)); // '{}'
        expect(toCanonicalJson(ws)).toEqual(JSON.stringify(ws)); // '{}'
        expect(toCanonicalJson(wm)).toEqual(JSON.stringify(wm)); // '{}'
      });
    });
  });
});

describe('Should behave in a canonical way', () => {
  it('JSON.stringify() cannot compute the same output when object keys order changes', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const obj2 = { c: 3, b: 2, a: 1 };
    const j1 = JSON.stringify(obj);
    const j2 = JSON.stringify(obj2);
    expect(j1).not.toBe(j2);
  });

  it('toCanonicalJson can compute the same output when object keys order changes', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const obj2 = { c: 3, b: 2, a: 1 };
    const j1 = toCanonicalJson(obj);
    const j2 = toCanonicalJson(obj2);
    expect(j1).toBe(j2);
  });

  it('sorts keys in a key-value object', () => {
    expect(toCanonicalJson({ number: 123, hello: 'world' })).toEqual('{"hello":"world","number":123}');
  });

  it('sorts key-value object nested in an array', () => {
    expect(toCanonicalJson([{ b: 123, a: 'string' }])).toEqual('[{"a":"string","b":123}]');
  });

  it('sorts keys when toJSON() is called from a key-value object', () => {
    const obj = {
      a: 'x',
      b: 'y',
      toJSON: function () {
        return { c: 'foo', b: this.b, a: this.a };
      },
    };
    expect(toCanonicalJson(obj)).toEqual('{"a":"x","b":"y","c":"foo"}');
  });

  it('sorts keys when toJSON() is called from a class', () => {
    class Foo {
      constructor(private a: number, private b: number) {}
      toJSON() {
        return { c: 'foo', b: this.b, a: this.a };
      }
    }
    const f = new Foo(123, 456);
    expect(toCanonicalJson(f)).toEqual('{"a":123,"b":456,"c":"foo"}');
  });

  it('sorts keys that are class attributes', () => {
    class Foo {
      constructor(private b: number, private a: number) {}
      add() {
        return this.a + this.b;
      }
    }
    const f = new Foo(123, 456);
    expect(toCanonicalJson(f)).toEqual('{"a":456,"b":123}');
  });
});
