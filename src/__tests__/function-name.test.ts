import {extractFunctionName} from "../function-name";

describe("function-name", () => {
    function hoge1 () {
    }
    function/*fuga*/hoge2() {
    }

    function /*fuga*/ hoge3() {
    }

    function hoge4/*fuga*/() {
    }

    function //fuga
    hoge5 /*piyo*/ //piyo
    () {
    }

    function \u0068\u006f\u0067\u0065() {
    }
    test("hoge1", () => {

        expect(extractFunctionName(hoge1)).toBe("hoge1");
    });
    test("hoge2", () => {
        expect(extractFunctionName(hoge2)).toBe("hoge2");
    });
    test("hoge3", () => {
        expect(extractFunctionName(hoge3)).toBe("hoge3");
    });
    test("hoge4", () => {
        expect(extractFunctionName(hoge4)).toBe("hoge4");
    });
    test("hoge5", () => {
        expect(extractFunctionName(hoge5)).toBe("hoge5");
    });
    test("\u0068\u006f\u0067\u0065", () => {
        // crazy
        expect(extractFunctionName(\u0068\u006f\u0067\u0065)).toBe("hoge");
    })
});