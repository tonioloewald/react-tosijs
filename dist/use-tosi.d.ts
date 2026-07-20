import React, { FunctionComponent, ComponentPropsWithRef } from "react";
import type { XinTouchableType } from "tosijs";
export declare const _resolvePathOf: (t: {
    tosiPath?: (x: any) => string | undefined;
    xinPath?: (x: any) => string | undefined;
}) => ((x: any) => string | undefined);
export declare const _resolveValueOf: (t: {
    tosiValue?: (x: any) => any;
    xinValue?: (x: any) => any;
}) => ((x: any) => any);
export type HookType<T = any> = [value: T, setValue: (newValue: T) => void];
/**
 * The useSyncExternalStore contract for one observed path. Exported for
 * tests (the mount-to-subscription gap can't be opened under act(), which
 * flushes effects synchronously).
 *
 * getSnapshot must return a stable value between store changes, and
 * xin[path] mints a fresh proxy per access (deliberate tosijs behavior —
 * proxies are wafer-thin, never cached) — so reads are cached in a
 * `{ value }` wrapper that is only replaced when something changed. The
 * wrapper's identity change is also what signals in-place mutations
 * (push, property writes), which leave the underlying raw value identical.
 */
export declare const _createStore: <T>(path: string, read: () => T) => {
    subscribe: (onStoreChange: () => void) => () => void;
    getSnapshot: () => {
        value: T;
    };
};
export declare const useTosi: <T = any>(observed: XinTouchableType, initialValue?: T) => HookType<T>;
/** @deprecated Use useTosi instead */
export declare const useXin: <T = any>(observed: XinTouchableType, initialValue?: T) => HookType<T>;
export type WebComponent<P extends object = {}, E extends HTMLElement = HTMLElement> = FunctionComponent<ComponentPropsWithRef<"div"> & P & {
    class?: string;
    ref?: React.Ref<E>;
}>;
type WebComponentProxy = Record<string, WebComponent>;
export declare const reactWebComponents: WebComponentProxy;
export {};
