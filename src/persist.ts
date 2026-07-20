import * as tosijs from "tosijs";
import type { XinTouchableType } from "tosijs";
import { _resolvePathOf, _resolveValueOf } from "./use-tosi";

const { xin, observe, unobserve } = tosijs;
const pathOf = _resolvePathOf(tosijs as any);
const valueOf = _resolveValueOf(tosijs as any);

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
export const persist = (
  observed: XinTouchableType,
  options: PersistOptions = {},
): (() => void) => {
  const path = typeof observed === "string" ? observed : pathOf(observed);
  if (typeof path !== "string") {
    throw new Error("persist must be passed a path or a tosijs proxy");
  }
  const storage = options.storage ?? (globalThis as any).localStorage;
  const key = options.key ?? `tosijs:${path}`;

  const stored = storage.getItem(key);
  if (stored !== null) {
    try {
      xin[path] = JSON.parse(stored);
    } catch (error) {
      console.error(`persist: ignoring unparseable stored value for ${key}`, error);
    }
  }

  const listener = observe(path, () => {
    try {
      storage.setItem(key, JSON.stringify(valueOf(xin[path])));
    } catch (error) {
      console.error(`persist: could not store value for ${key}`, error);
    }
  });
  return () => {
    unobserve(listener);
  };
};
