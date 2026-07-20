// src/use-tosi.ts
import {
  useState,
  useEffect,
  useCallback,
  createElement
} from "react";
import { xin, observe, unobserve, tosiPath } from "tosijs";
var useTosi = function(observed, initialValue) {
  const path = typeof observed === "string" ? observed : tosiPath(observed);
  if (typeof path !== "string") {
    console.error("useTosi must either be passed a path or a tosijs proxy", observed);
    throw new Error("useTosi must either be passed a path or a tosijs proxy");
  }
  const [value, update] = useState(() => xin[path] !== undefined ? xin[path] : initialValue);
  useEffect(() => {
    const listener = observe(path, () => {
      update(xin[path]);
    });
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
  reactWebComponents
};

//# debugId=0EC1278CE5C1341F64756E2164756E21
//# sourceMappingURL=index.js.map
