// src/use-tosi.ts
import {
  useState,
  useEffect,
  useCallback,
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
var useTosi = function(observed, initialValue) {
  const path = typeof observed === "string" ? observed : pathOf(observed);
  if (typeof path !== "string") {
    console.error("useTosi must either be passed a path or a tosijs proxy", observed);
    throw new Error("useTosi must either be passed a path or a tosijs proxy");
  }
  const [value, update] = useState(() => xin[path] !== undefined ? xin[path] : initialValue);
  useEffect(() => {
    const sync = () => {
      update(() => xin[path] !== undefined ? xin[path] : initialValue);
    };
    const listener = observe(path, sync);
    sync();
    return () => {
      unobserve(listener);
    };
  }, [path]);
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
var version = "1.1.0";
export {
  version,
  useXin,
  useTosi,
  reactWebComponents,
  _resolvePathOf
};

//# debugId=B7071837C688297D64756E2164756E21
//# sourceMappingURL=index.js.map
