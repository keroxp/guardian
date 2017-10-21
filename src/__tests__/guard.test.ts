import {assertify, guard, promiseGuard, unless} from "../guard";
import {isNull, isString} from "util";

describe("guard", () => {
    describe("unless", () => {
        test("unless", () => {
            const arg = "string";
            const isNotString = unless(isString);
            expect(!isNotString(arg)).toBe(isString(arg));
        });
    });
    describe("assertify", () => {
        test("assertify", () => {
            const isA = (arg) => arg === "a";
            const assertIsA = assertify(isA);
            expect(() => assertIsA("a")).not.toThrow();
            expect(() => assertIsA("b")).toThrow();
        });
    });
    describe("guard", () => {
        test("", () => {
            const g = guard(a => {
                if (a === 0) throw "error"
            });
            expect(() => g.args(0).thenThrow()).toThrow();
            expect(() => g.args(1).thenThrow()).not.toThrow();
            expect(() => g.args(0, 1, 2).thenThrow()).toThrow();
            expect(() => g.args(1, 2, 0).thenThrow()).toThrow();
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
        test("NG", async () => {
            await expect(promiseGuard(a, 0)).rejects.toBeDefined();
        });
    });
});