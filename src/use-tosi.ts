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

// tosiValue (né xinValue) unwraps a proxy to the raw underlying data —
// both spot-checked present at tosijs 1.0.6; like _resolvePathOf, a
// version with neither is a loud error, not a silent degradation
export const _resolveValueOf = (t: {
  tosiValue?: (x: any) => any;
  xinValue?: (x: any) => any;
}): ((x: any) => any) => {
  const fn = t.tosiValue ?? t.xinValue;
  if (fn === undefined) {
    throw new Error(
      "react-tosijs requires tosijs ^1.0.6 (found neither tosiValue nor xinValue export)",
    );
  }
  return fn;
};

const valueOf = _resolveValueOf(tosijs as any);

export type HookType<T = any> = [value: T, setValue: (newValue: T) => void];

const BAD_ARGUMENT = "useTosi must either be passed a path or a tosijs proxy";

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
export const _createStore = <T,>(path: string, read: () => T) => {
  let snapshot = { value: read() };
  // objects and functions always propagate — in-place mutation preserves
  // their identity, so Object.is can't distinguish touch-worthy changes
  const changed = (next: T): boolean =>
    (typeof next === "object" && next !== null) ||
    typeof next === "function" ||
    !Object.is(next, snapshot.value);
  return {
    subscribe: (onStoreChange: () => void) => {
      const listener = observe(path, () => {
        const next = read();
        if (changed(next)) {
          snapshot = { value: next };
          onStoreChange();
        }
      });
      // a tosijs flush can land while the hook is unsubscribed (delayed
      // passive effects, React 19 <Activity hidden>) — re-sync so React's
      // post-subscribe consistency check sees it. Compared on RAW values
      // (not proxy identity) so an unchanged object doesn't cause a second
      // mount render; the residual gap — an in-place mutation flushed
      // pre-subscribe — leaves raw identity equal and is not detectable
      // here, only narrowable via tosijs#17's requested seam.
      const next = read();
      if (!Object.is(valueOf(next), valueOf(snapshot.value))) {
        snapshot = { value: next };
        onStoreChange();
      }
      return () => {
        unobserve(listener);
      };
    },
    getSnapshot: () => snapshot,
  };
};

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

  const store = useMemo(
    () =>
      _createStore<T>(path, () =>
        xin[path] !== undefined ? xin[path] : (initialValueRef.current as T),
      ),
    [path],
  );

  // server and client reads coincide (tosijs needs DOM globals to load at
  // all, so SSR means a DOM-shimmed pipeline) — getServerSnapshot keeps
  // renderToString/prerender working
  const { value } = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );

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
