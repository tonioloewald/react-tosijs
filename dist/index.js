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
var _resolveValueOf = (t) => {
  const fn = t.tosiValue ?? t.xinValue;
  if (fn === undefined) {
    throw new Error("react-tosijs requires tosijs ^1.0.6 (found neither tosiValue nor xinValue export)");
  }
  return fn;
};
var valueOf = _resolveValueOf(tosijs);
var BAD_ARGUMENT = "useTosi must either be passed a path or a tosijs proxy";
var _createStore = (path, read) => {
  let snapshot = { value: read() };
  const changed = (next) => typeof next === "object" && next !== null || typeof next === "function" || !Object.is(next, snapshot.value);
  return {
    subscribe: (onStoreChange) => {
      const listener = observe(path, () => {
        const next2 = read();
        if (changed(next2)) {
          snapshot = { value: next2 };
          onStoreChange();
        }
      });
      const next = read();
      if (!Object.is(valueOf(next), valueOf(snapshot.value))) {
        snapshot = { value: next };
        onStoreChange();
      }
      return () => {
        unobserve(listener);
      };
    },
    getSnapshot: () => snapshot
  };
};
var useTosi = function(observed, initialValue) {
  const path = typeof observed === "string" ? observed : pathOf(observed);
  if (typeof path !== "string") {
    console.error(BAD_ARGUMENT, observed);
    throw new Error(BAD_ARGUMENT);
  }
  const initialValueRef = useRef(initialValue);
  initialValueRef.current = initialValue;
  const store = useMemo(() => _createStore(path, () => xin[path] !== undefined ? xin[path] : initialValueRef.current), [path]);
  const { value } = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
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
// src/paths.ts
var typedTosi = () => ({
  useTosi: (path, initialValue) => useTosi(path, initialValue)
});
// src/persist.ts
import * as tosijs2 from "tosijs";
var { xin: xin2, observe: observe2, unobserve: unobserve2 } = tosijs2;
var pathOf2 = _resolvePathOf(tosijs2);
var valueOf2 = _resolveValueOf(tosijs2);
var persist = (observed, options = {}) => {
  const path = typeof observed === "string" ? observed : pathOf2(observed);
  if (typeof path !== "string") {
    throw new Error("persist must be passed a path or a tosijs proxy");
  }
  const storage = options.storage ?? globalThis.localStorage;
  if (storage === undefined) {
    throw new Error(`persist: no storage available for ${path} — pass options.storage in non-browser environments`);
  }
  const key = options.key ?? `tosijs:${path}`;
  const stored = storage.getItem(key);
  if (stored !== null) {
    try {
      xin2[path] = JSON.parse(stored);
    } catch (error) {
      console.error(`persist: ignoring unparseable stored value for ${key}`, error);
    }
  }
  let writeQueued = false;
  let stopped = false;
  const write = () => {
    writeQueued = false;
    if (stopped)
      return;
    try {
      const json = JSON.stringify(valueOf2(xin2[path]));
      storage.setItem(key, json === undefined ? "null" : json);
    } catch (error) {
      console.error(`persist: could not store value for ${key}`, error);
    }
  };
  const listener = observe2(path, () => {
    if (!writeQueued) {
      writeQueued = true;
      queueMicrotask(write);
    }
  });
  return () => {
    stopped = true;
    unobserve2(listener);
  };
};
// src/devtools.ts
import * as tosijs3 from "tosijs";
var { xin: xin3, observe: observe3, unobserve: unobserve3 } = tosijs3;
var valueOf3 = _resolveValueOf(tosijs3);
var connectDevTools = ({
  name = "tosijs",
  roots
}) => {
  const extension = globalThis.__REDUX_DEVTOOLS_EXTENSION__;
  if (!extension) {
    return () => {};
  }
  const connection = extension.connect({ name });
  const snapshot = () => Object.fromEntries(roots.map((root) => [root, valueOf3(xin3[root])]));
  connection.init(snapshot());
  const listeners = roots.map((root) => observe3(root, (path) => {
    connection.send({ type: path }, snapshot());
  }));
  return () => {
    for (const listener of listeners) {
      unobserve3(listener);
    }
    connection.unsubscribe?.();
  };
};
// src/version.ts
var version = "1.2.0";
export {
  version,
  useXin,
  useTosi,
  typedTosi,
  reactWebComponents,
  persist,
  connectDevTools,
  _resolveValueOf,
  _resolvePathOf,
  _createStore
};

//# debugId=061E49ED24C73A9464756E2164756E21
//# sourceMappingURL=index.js.map
