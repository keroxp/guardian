import {assertify, guard, isGuard, promiseGuard, unless} from "../guard";
import {isNull, isString} from "util";
import {functionName} from "../function-name";

describe("guard", () => {
    describe("unless", () => {
        test("unless", () => {
            const arg = "string";
            const isNotString = unless(isString);
            expect(!isNotString(arg)).toBe(isString(arg));
        });
        test("unless named", () => {
            const isNotString = unless(isString, true);
            expect(functionName(isNotString)).toBe("unless_isString");
        })
    });
    describe("assertify", () => {
        test("assertify", () => {
            const isA = (arg) => arg === "a";
            const assertIsA = assertify(isA);
            expect(() => assertIsA("a")).not.toThrow();
            expect(() => assertIsA("b")).toThrow();
        });
        test("assertify message", () => {
            const a = assertify(a => a > 0, "custom message");
            let err;
            try {
                a(-1);
            } catch (e) {
                err = e;
            }
            expect(err.message).toMatch(/^custom message:/);
        });
        test("assertify named", () => {
            const isA = a => a === "a";
            const assertIsA = assertify(isA, null, true);
            expect(functionName(assertIsA)).toBe("assert_isA");
        });
    });
    describe("guard", () => {
        test("guard", () => {
            const af = () => {};
            expect(isGuard(guard([]))).toBe(true);
            expect(isGuard(guard(af))).toBe(true);
            expect(isGuard(guard([af,af]))).toBe(true);
            const g = guard(af);
            expect(isGuard(guard(g))).toBe(true);
            expect(isGuard(guard([g,g]))).toBe(true);
            expect(() => guard(null)).toThrow();
            expect(() => guard(void 0)).toThrow();
            expect(() => guard(eval("{}"))).toThrow();
        });
        test("thenThrow", () => {
            const g = guard(a => {
                if (a === 0) throw "error"
            });
            expect(() => g.args(0).thenThrow()).toThrow();
            expect(() => g.args(1).thenThrow()).not.toThrow();
            expect(() => g.args(0, 1, 2).thenThrow()).toThrow();
            expect(() => g.args(1, 2, 0).thenThrow()).toThrow();
        });
        test("thenThrow with messagePrefix", () => {
            const g = guard(a => {
                if (a === 0) throw "error"
            });
            let err;
            try {
                g.args(1, 2, 0).thenThrow(Error, "custom message")
            } catch (e) {
                err = e;
            }
            expect(err.message).toMatch(/^custom message: error/);
        });
        test("thenThrow", () => {
            const g = guard(a => {
                if (a === 0) throw "error"
            });
            expect(() => g.args(0).thenThrow(Error)).toThrowError(Error);
            expect(() => g.args(1).thenThrow(Error)).not.toThrow();
            expect(() => g.args(0, 1, 2).thenThrow(Error)).toThrowError(Error);
            expect(() => g.args(1, 2, 0).thenThrow(Error)).toThrowError(Error);
        });
        test("type guard", () => {
            const assertIsString = assertify(isString);
            const g = guard(assertIsString);
            expect(() => g.args("").thenThrow()).not.toThrow();
            expect(() => g.args(null).thenThrow()).toThrow();
            expect(() => g.args({}).thenThrow()).toThrow();
        });
        test("unless", () => {
            const assertIsNotString = assertify(unless(isString));
            const g = guard(assertIsNotString);
            expect(() => g.args(0).thenThrow()).not.toThrow();
            expect(() => g.args("").thenThrow()).toThrow();
        });
        test("chain", () => {
            const g = guard(unless(assertify(isNull)));
            expect(() => g.args(0).thenThrow().args(null).thenThrow()).toThrow();
        });
        test("guard with guards", () => {
            const g1 = guard(assertify(isString));
            const g2 = guard(assertify((s: string) => s.length >= 2));
            const g = guard([g1, g2]);
            expect(() => g.args("ab", "cd", "ef").thenThrow()).not.toThrow();
            expect(() => g.args("", 0).thenThrow()).toThrow();
            expect(() => g.args("ab", "c", "d").thenThrow()).toThrow();
        });
    });
    describe("promiseGuard", () => {
        const a = assertify(isString);
        test("OK", async () => {
            await expect(promiseGuard(a, "")).resolves.toBe(true);
        });
        test("with multi args", async () => {
            await expect(promiseGuard(a, "", 1 ,2)).rejects.toBeDefined();
        });
        test("NG", async () => {
            await expect(promiseGuard(a, 0)).rejects.toBeDefined();
        });
    });
});