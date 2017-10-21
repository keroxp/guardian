import {isArray, isString} from "util";
import {functionName} from "./function-name";

export function isFalsy(arg: any): boolean {
    return !arg;
}

export function isTruthy(arg: any): boolean {
    return !!arg;
}

export function isStringAndNotEmpty(arg: any): boolean {
    return isString(arg) && arg.length > 0;
}

const ISO_DATE_REGEXP = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/;

export function isISO8601String(value: any): boolean {
    return isString(value) && isTruthy(value.match(ISO_DATE_REGEXP));
}

export function areNotNull(...args): boolean {
    for (const a of args) {
        if (a === null) return false;
    }
    return true;
}

export function assertAreNotNull(args: any[], error: string = "arguments contains null") {
    if (!areNotNull(args)) throw new Error("argument itself is null");
    if (!areNotNull(...args)) throw new Error(error);
}

export function areNeitherNullNorUndefined(...args): boolean {
    for (const a of args) {
        if (a === void 0 || a === null) return false;
    }
    return true;
}

export function assertAreNeitherNullNorUndefined(...args: any[]) {
    if (!areNeitherNullNorUndefined(...args)) throw new Error(`arguments contain null or undefined: [${args}]`);
}

export function assertHasOwnProperties(obj: any, prop: string[]) {
    const missings = [];
    if (!hasOwnProperties(obj, prop, missings)) {
        const e = `missing properties: ${missings.toString()}"`;
        throw new Error(e);
    }
}

export function hasOwnProperties(obj: any, props: string[], missingProps?: string[]): boolean {
    const missings = missingProps || [];
    for (const p of props) {
        if (!obj.hasOwnProperty(p)) missings.push(p);
    }
    return missings.length === 0;
}

export type Predicate = (...arg) => boolean;

export function logicalAnd(...predicates: Predicate[]): Predicate {
    return (...args) => {
        for (const p of predicates) if (!p(...args)) return false;
        return true;
    }
}

export function hasOwnDefinedProperties(obj: any, prop: { [key: string]: Predicate | Predicate[] }, missingProperties?: string[]): boolean {
    const missings = missingProperties || [];
    for (const p in prop) {
        const func = prop[p];
        if (!obj.hasOwnProperty(p)) {
            missings.push(`property missing: "${p}"`);
        } else {
            let predicate: Predicate;
            let funcName: string;
            if (isArray(func)) {
                predicate = logicalAnd(...func);
                funcName = func.map(functionName).join(" && ");
            } else {
                predicate = func;
                funcName = functionName(func);
            }
            if (!predicate(obj[p])) missings.push(`property mismatch: "${p}" != ${funcName}`);
        }
    }
    return missings.length === 0;
}

export function assertHasOwnDefinedProperties(obj: any, prop: { [key: string]: Predicate | Predicate[] }) {
    const missings = [];
    if (!hasOwnDefinedProperties(obj, prop, missings)) {
        let e = `invalid type definition:\n`;
        for (const m of missings) {
            e += `\t${m}\n`;
        }
        throw new Error(e);
    }
}
