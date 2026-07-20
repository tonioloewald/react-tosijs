// src/use-tosi.ts
import {
  useCallback,
  useMemo,
  useRef,
  useSyncExternalStore,
  createElement
} from "react";
import * as tosijs from "tosijs";
var { xin, observe, unobserve } = tosijs;
var _resolvePathOf = (t) => {
  const fn = t.tosiPath ?? t.xinPath;
  if (fn === undefined) {
    throw new Error("react-tosijs requires tosijs ^1.0.6 (found neither tosiPath nor xinPath export)");
  }
  return fn;
};
var pathOf = _resolvePathOf(tosijs);
var BAD_ARGUMENT = "useTosi must either be passed a path or a tosijs proxy";
var useTosi = function(observed, initialValue) {
  const path = typeof observed === "string" ? observed : pathOf(observed);
  if (typeof path !== "string") {
    console.error(BAD_ARGUMENT, observed);
    throw new Error(BAD_ARGUMENT);
  }
  const initialValueRef = useRef(initialValue);
  initialValueRef.current = initialValue;
  const store = useMemo(() => {
    const read = () => xin[path] !== undefined ? xin[path] : initialValueRef.current;
    let snapshot = { value: read() };
    return {
      subscribe: (onStoreChange) => {
        const listener = observe(path, () => {
          const next = read();
          if (typeof next === "object" && next !== null || !Object.is(next, snapshot.value)) {
            snapshot = { value: next };
            onStoreChange();
          }
        });
        return () => {
          unobserve(listener);
        };
      },
      getSnapshot: () => snapshot
    };
  }, [path]);
  const { value } = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const setValue = useCallback((newValue) => {
    xin[path] = newValue;
  }, [path]);
  return [value, setValue];
};
var useXin = useTosi;
var reactWebComponents = new Proxy({}, {
  get(target, key) {
    if (typeof key !== "string") {
      return target[key];
    }
    const tagName = key.replace(/([a-z])([A-Z])/g, (_, first, last) => {
      return first + "-" + last.toLocaleLowerCase();
    });
    if (!target[tagName]) {
      target[tagName] = (props) => createElement(tagName, props);
    }
    return target[tagName];
  }
});
// src/version.ts
var version = "1.2.0";
export {
  version,
  useXin,
  useTosi,
  reactWebComponents,
  _resolvePathOf
};

//# debugId=8209F27E3FC6BA1B64756E2164756E21
//# sourceMappingURL=index.js.map
