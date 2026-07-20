import React, { FunctionComponent, ComponentPropsWithRef } from "react";
import { XinTouchableType } from "tosijs";
type HookType<T = any> = [value: T, setValue: (newValue: T) => void];
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
