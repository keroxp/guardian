import {isArray, isFunction} from "util";
import {assertAreNeitherNullNorUndefined, Predicate} from "./assert";
import {functionName} from "./function-name";

export interface ThenThrow {
    thenThrow(mapper?: (e) => any, prefixMessage?: string): Guard;
}

export interface Guard extends ThenThrow {
    readonly funcs: Function[];
    args(...args: any[]): ThenThrow;
}

export function isGuard(obj: any): obj is Guard {
    return obj instanceof GuardImpl;
}

class GuardImpl implements Guard {
    funcs: Function[] = [];
    _args: any[] = [];

    constructor(funcs: Function[], ...args: any[]) {
        this.funcs = funcs;
        this.args(...args);
    }

    args(...args: any[]): ThenThrow {
        this._args = args;
        return this;
    }

    thenThrow(mapper: (e) => any = e => new Error(e), prefixMessage?: string) {
        try {
            for (const func of this.funcs) {
                for (const a of this._args) {
                    func(a);
                }
            }
            return this;
        } catch (e) {
            let msg = e.message;
            if (prefixMessage) msg = `${prefixMessage}: error =${e.message}`;
            throw mapper(msg);
        }
    }
}

export function namedFunction (name, func, thisarg?) {
    const str = `return function (func, thisarg) {        
        return function ${name} (...args) {
            return func.call(thisarg || this, ...args);
        }        
    };`;
    return new Function(str)()(func, thisarg);
}


export function unless(func: Predicate, named: boolean = false): Predicate {
    const ret = (...args) => !func(...args);
    return named ? namedFunction(`unless_${functionName(func)}`, ret) : ret;
}

export function assertify(func: Predicate, messagePrefix?: string, named: boolean = false): AssertFunc {
    const ret = (...args) => {
        let msg = `assertion failed: [${args.toString()}] != ${functionName(func)}`;
        if (messagePrefix) msg = `${messagePrefix}: ${msg}`;
        if (!func(...args)) throw new Error(msg);
    };
    return named ? namedFunction(`assert_${functionName(func)}`, ret) : ret;
}

export type AssertFunc = (...args) => any;

export function guard(func: AssertFunc | AssertFunc[] | Guard | Guard[], ...args: any[]): Guard {
    if (isArray(func)) {
        if (func.length === 0) {
            return new GuardImpl([], ...args);
        } else if (isFunction(func[0])) {
            return new GuardImpl(func as Function[], ...args);
        } else if (isGuard(func[0])) {
            const funcs = [];
            for (const g of <Guard[]>func) {
                funcs.push(...g.funcs);
            }
            return new GuardImpl(funcs, ...args);
        }
    }
    else if (isGuard(func)) {
        return new GuardImpl(func.funcs, ...args);
    }
    else if (isFunction(func)) {
        return new GuardImpl([func], ...args);
    }
    throw new Error(`assert func is invalid: func=${func}`);
}

export function promiseGuard(func: AssertFunc | AssertFunc[] | Guard | Guard[], firstArg: any, ...restArgs: any[]): Promise<boolean> {
    try {
        guard(func, ...[firstArg, ...restArgs]).thenThrow();
        return Promise.resolve(true);
    } catch (e) {
        return Promise.reject(e);
    }
}