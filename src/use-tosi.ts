import React, {
  useState,
  useEffect,
  useCallback,
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

type HookType<T = any> = [value: T, setValue: (newValue: T) => void];

export const useTosi = function <T = any>(
  observed: XinTouchableType,
  initialValue?: T,
): HookType<T> {
  const path = typeof observed === "string" ? observed : pathOf(observed);
  if (typeof path !== "string") {
    console.error(
      "useTosi must either be passed a path or a tosijs proxy",
      observed,
    );
    throw new Error("useTosi must either be passed a path or a tosijs proxy");
  }
  const [value, update] = useState<T>(() =>
    xin[path] !== undefined ? xin[path] : initialValue,
  );
  useEffect(() => {
    // the updater form keeps function values stored as values, not
    // invoked as updaters
    const sync = (): void => {
      update(() => (xin[path] !== undefined ? xin[path] : initialValue));
    };
    const listener = observe(path, sync);
    // observe() only fires on touch — sync now in case the path changed
    // since the last committed render
    sync();
    return () => {
      unobserve(listener);
    };
  }, [path]);
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
