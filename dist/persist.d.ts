import type { XinTouchableType } from "tosijs";
export interface PersistOptions {
    /** anything with localStorage's getItem/setItem (defaults to localStorage) */
    storage?: Pick<Storage, "getItem" | "setItem">;
    /** storage key (defaults to `tosijs:${path}`) */
    key?: string;
}
/**
 * Persist the value at a tosijs path: hydrate it from storage now (if a
 * stored value exists), then write it back (JSON, raw values) on every
 * change. Framework-free — works whether the path is rendered by React,
 * web components, or nothing at all. Returns a stop function.
 *
 *   const stop = persist('app.todos')
 */
export declare const persist: (observed: XinTouchableType, options?: PersistOptions) => (() => void);
