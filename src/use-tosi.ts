import React, {
  useCallback,
  useMemo,
  useRef,
  useSyncExternalStore,
  createElement,
  FunctionComponent,
  ComponentPropsWithRef,
} from "react";
import * as tosijs from "tosijs";
import type { XinTouchableType } from "tosijs";

const { xin, observe, unobserve } = tosijs;

// tosiPath arrived in tosijs 1.1; fall back to xinPath so the wide
// peer range (^1.0.6) keeps working. Exported for tests only.
export const _resolvePathOf = (t: {
  tosiPath?: (x: any) => string | undefined;
  xinPath?: (x: any) => string | undefined;
}): ((x: any) => string | undefined) => {
  const fn = t.tosiPath ?? t.xinPath;
  if (fn === undefined) {
    throw new Error(
      "react-tosijs requires tosijs ^1.0.6 (found neither tosiPath nor xinPath export)",
    );
  }
  return fn;
};

const pathOf = _resolvePathOf(tosijs as any);

export type HookType<T = any> = [value: T, setValue: (newValue: T) => void];

const BAD_ARGUMENT = "useTosi must either be passed a path or a tosijs proxy";

export const useTosi = function <T = any>(
  observed: XinTouchableType,
  initialValue?: T,
): HookType<T> {
  const path = typeof observed === "string" ? observed : pathOf(observed);
  if (typeof path !== "string") {
    console.error(BAD_ARGUMENT, observed);
    throw new Error(BAD_ARGUMENT);
  }

  // a ref so a changed fallback prop is seen by later reads
  const initialValueRef = useRef(initialValue);
  initialValueRef.current = initialValue;

  const store = useMemo(() => {
    const read = (): T =>
      xin[path] !== undefined ? xin[path] : (initialValueRef.current as T);
    // useSyncExternalStore requires getSnapshot to return a stable value
    // between store changes, and xin[path] mints a fresh proxy per access —
    // so the snapshot wrapper is only replaced when the observer fires.
    // Its identity change is also what signals in-place mutations (push,
    // property writes), which leave the underlying raw value identical.
    let snapshot = { value: read() };
    return {
      subscribe: (onStoreChange: () => void) => {
        const listener = observe(path, () => {
          const next = read();
          // skip no-op touches for primitives; objects/functions can't be
          // deduped by identity (in-place mutations preserve it)
          if (
            (typeof next === "object" && next !== null) ||
            !Object.is(next, snapshot.value)
          ) {
            snapshot = { value: next };
            onStoreChange();
          }
        });
        return () => {
          unobserve(listener);
        };
      },
      getSnapshot: () => snapshot,
    };
  }, [path]);

  const { value } = useSyncExternalStore(store.subscribe, store.getSnapshot);

  const setValue = useCallback(
    (newValue: T): void => {
      xin[path] = newValue;
    },
    [path],
  );
  return [value, setValue];
};

/** @deprecated Use useTosi instead */
export const useXin = useTosi;

export type WebComponent<
  P extends object = {},
  E extends HTMLElement = HTMLElement,
> = FunctionComponent<
  // React 18 sets props on custom elements as attributes verbatim, so
  // `class` works where `className` would render as `classname`
  ComponentPropsWithRef<"div"> & P & { class?: string; ref?: React.Ref<E> }
>;

type WebComponentProxy = Record<string, WebComponent>;

export const reactWebComponents: WebComponentProxy = new Proxy(
  {} as WebComponentProxy,
  {
    get(target, key): WebComponent {
      if (typeof key !== "string") {
        return (target as any)[key];
      }

      const tagName = key.replace(
        /([a-z])([A-Z])/g,
        (_: string, first: string, last: string): string => {
          return first + "-" + last.toLocaleLowerCase();
        },
      );

      if (!target[tagName]) {
        target[tagName] = (props: any) =>
          createElement<any, Element>(tagName, props);
      }

      return target[tagName];
    },
  },
);
