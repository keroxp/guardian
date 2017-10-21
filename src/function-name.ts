// for es5, (IE)
const kSupportFunctionDotName = (() => function func () {})()["name"] === "func";
export function functionName (func: Function): string {
    return kSupportFunctionDotName ? func["name"] : extractFunctionName(func);
}
export function extractFunctionName (func: Function) {
    const str = func.toString();
    const m = str.match(/^function (.+?)\(/);
    return m ? m[1] : "";
}