import {
    assertAreNeitherNullNorUndefined, assertAreNotNull, assertHasOwnDefinedProperties, assertHasOwnProperties,
    hasOwnDefinedProperties, hasOwnProperties, isFalsy, isISO8601String, isStringAndNotEmpty, isTruthy,
    logicalAnd
} from "../assert";
import {isArray, isNumber, isString} from "util";
import {namedFunction} from "../guard";

describe("assert", () => {
    test("isFalsy", () => {
        expect(isFalsy(0)).toBe(true);
        expect(isFalsy(1)).toBe(false);
        expect(isFalsy(null)).toBe(true);
        expect(isFalsy(undefined)).toBe(true);
        expect(isFalsy(false)).toBe(true);
        expect(isFalsy({})).toBe(false);
        expect(isFalsy([])).toBe(false);
        expect(isFalsy(isFalsy)).toBe(false);
    });
    test("isTruthy", () => {
        expect(isTruthy(0)).toBe(false);
        expect(isTruthy(1)).toBe(true);
        expect(isTruthy(null)).toBe(false);
        expect(isTruthy(undefined)).toBe(false);
        expect(isTruthy(false)).toBe(false);
        expect(isTruthy({})).toBe(true);
        expect(isTruthy([])).toBe(true);
        expect(isTruthy(isFalsy)).toBe(true);
    });
    test("isStringAndNotEmpty", () => {
        expect(isStringAndNotEmpty("")).toBe(false);
        expect(isStringAndNotEmpty(" ")).toBe(true);
        expect(isStringAndNotEmpty([])).toBe(false);
        expect(isStringAndNotEmpty({})).toBe(false);
        expect(isStringAndNotEmpty(1)).toBe(false);
    });
    test("isISO8601String", () => {
        expect(isISO8601String("2011-10-05T14:48:00.000Z")).toBe(true);
        expect(isISO8601String("2011-10-05T14:48:00.000+09:00")).toBe(true);
        expect(isISO8601String("2011-10-05T14:48:00.000-09:00")).toBe(true);
        expect(isISO8601String("011-10-05T14:48:00.000Z")).toBe(false);
        expect(isISO8601String("2011-10-05T14:48:00.000")).toBe(false);
    });
    test("assertAreNotNull", () => {
        expect(() => assertAreNotNull(null)).toThrow("argument itself is null");
        expect(() => assertAreNotNull([0, "", [], {}, false, undefined, void 0])).not.toThrow();
        expect(() => assertAreNotNull(null)).toThrow();
        expect(() => assertAreNotNull([null])).toThrow();
    });
    test("assertAreNeitherNullNorUndefined", () => {
        expect(() => assertAreNeitherNullNorUndefined([0, "", [], {}, false])).not.toThrow();
        expect(() => assertAreNeitherNullNorUndefined(null)).toThrow();
        expect(() => assertAreNeitherNullNorUndefined(void 0)).toThrow();
        expect(() => assertAreNeitherNullNorUndefined(...[null])).toThrow();
        expect(() => assertAreNeitherNullNorUndefined(...[void 0])).toThrow();
        expect(() => assertAreNeitherNullNorUndefined(...["", void 0])).toThrow();
        expect(() => assertAreNeitherNullNorUndefined(...["", null])).toThrow();
    });
    test("hasOwnProperties", () => {
        expect(hasOwnProperties({
            a: 0, b: 1
        }, ["a", "b"])).toBe(true);
        expect(hasOwnProperties({
            a: 0,
        }, ["a", "b"])).toBe(false);
        expect(hasOwnProperties({
            a: 0,
        }, [null, undefined])).toBe(false);
    });
    test("assertHasOwnProperties", () => {
        expect(() => assertHasOwnProperties({
            a: 0, b: 1
        }, ["a", "b"])).not.toThrow();
        expect(() => assertHasOwnProperties({
            a: 0,
        }, ["a", "b"])).toThrow();
        expect(() => assertHasOwnProperties({
            a: 0,
        }, [null, undefined])).toThrow();
    });
    test("hasOwnPropertiesはないフィールドを書き出す", () => {
        const dest = [];
        expect(hasOwnProperties({
            a: 0, d: 0
        }, ["a", "b", "c", "d"], dest)).toBe(false);
        expect(dest.length).toBe(2);
        expect(dest.indexOf("b")).toBeGreaterThan(-1);
        expect(dest.indexOf("c")).toBeGreaterThan(-1);
    });
    describe("logicalAnd", () => {
        const isString = (arg) => typeof arg === "string";
        const is5Chars = (arg: string) => arg.length === 5;
        const ret = logicalAnd(isString, is5Chars);
        test("predicateを合成する", () => {
            expect(ret("12345")).toBe(true);
            expect(ret("false")).toBe(true);
        });
    });
    describe("hasOwnDefinedProperties", () => {
        test("ちゃんとやる", () => {
            const obj = {
                str: "",
                num: 1,
                arr: [],
                loilo: "loilo",
            };
            expect(hasOwnDefinedProperties(obj, {
                "str": isString,
                "num": isNumber,
                "arr": isArray,
                "loilo": [isString, str => str.length === 5]
            })).toBe(true);
        });
        test("失敗した場合は、失敗したpropのkeyとpredicateの名前を列挙する", () => {
            const dest = [];
            const obj = {
                str: "",
                num: "12",
                arr: {},
                loilo: "loilo-note",
            };
            const isLoiLo = str => str.length === 5;
            expect(hasOwnDefinedProperties(obj, {
                "str": isString,
                "num": isNumber,
                "arr": isArray,
                "missing": isString,
                "loilo": [isString, isLoiLo]
            }, dest)).toBe(false);
            expect(dest[0]).toBe("property mismatch: \"num\" != isNumber");
            expect(dest[1]).toBe("property mismatch: \"arr\" != isArray");
            expect(dest[2]).toBe("property missing: \"missing\"");
            expect(dest[3]).toBe("property mismatch: \"loilo\" != isString && isLoiLo");
        });
    });
    describe("assertHasOwnDefinedProperties", () => {
        test("assert失敗した場合は、失敗したpropのkeyとpredicateの名前を列挙した例外を投げる", () => {
            const obj = {
                str: "",
                num: "12",
                arr: {},
                loilo: "loilo-note",
            };
            const isLoiLo = str => str.length === 5;
            let err = "invalid type definition:\n";
            err += "\tproperty mismatch: \"num\" != isNumber\n";
            err += "\tproperty mismatch: \"arr\" != isArray\n";
            err += "\tproperty missing: \"missing\"\n";
            err += "\tproperty mismatch: \"loilo\" != isString && isLoiLo\n";
            expect(() => {
                assertHasOwnDefinedProperties(obj, {
                    "str": isString,
                    "num": isNumber,
                    "arr": isArray,
                    "missing": isString,
                    "loilo": [isString, isLoiLo]
                })
            }).toThrow(err);
        });
    });

    describe("namedFunction", () => {
        test("名前付き関数を返す", () => {
            let o = {i: 1};
            const func = namedFunction("myFunc", a => o.i += a);
            expect(func.name).toBe("myFunc");
            expect(func(10)).toBe(11);
        });
        test("this束縛", () => {
            const self = new function () {
                this.title = "title:"
            };
            const func = namedFunction("returnTitle", function (arg) {
                return this.title + arg;
            }, self);
            expect(func.name).toBe("returnTitle");
            expect(func("loilo")).toBe("title:loilo");
        });
    });
});