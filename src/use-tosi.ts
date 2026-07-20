import React, {
  useState,
  useEffect,
  useCallback,
  createElement,
  FunctionComponent,
  ComponentPropsWithRef,
} from "react";
import { xin, observe, unobserve, tosiPath, XinTouchableType } from "tosijs";

type HookType<T = any> = [value: T, setValue: (newValue: T) => void];

export const useTosi = function <T = any>(
  observed: XinTouchableType,
  initialValue?: T,
): HookType<T> {
  const path = typeof observed === "string" ? observed : tosiPath(observed);
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
    const listener = observe(path, () => {
      update(xin[path]);
    });
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
