import { describe, test, expect, afterEach, spyOn } from "bun:test";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { xinProxy, updates } from "tosijs";
import {
  useTosi,
  useXin,
  reactWebComponents,
  _resolvePathOf,
} from "../src/index";

const { state } = xinProxy({
  state: {
    greeting: "hello",
    count: 0,
    todos: [{ id: 1, text: "write tests" }] as { id: number; text: string }[],
    first: "alpha",
    second: "beta",
  },
});

let roots: Root[] = [];
let containers: HTMLElement[] = [];

function render(element: React.ReactElement): HTMLElement {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  act(() => {
    root.render(element);
  });
  roots.push(root);
  containers.push(container);
  return container;
}

afterEach(() => {
  for (const root of roots) {
    act(() => root.unmount());
  }
  for (const container of containers) {
    container.remove();
  }
  roots = [];
  containers = [];
});

const flush = () => act(async () => {
  await updates();
});

describe("useTosi", () => {
  test("returns the current value at a path", () => {
    const Greeting = () => {
      const [greeting] = useTosi<string>("state.greeting");
      return <div>{greeting}</div>;
    };
    const container = render(<Greeting />);
    expect(container.textContent).toBe("hello");
  });

  test("falls back to initialValue when the path is empty", () => {
    const Fallback = () => {
      const [missing] = useTosi<string>("state.missing", "default");
      return <div>{missing}</div>;
    };
    const container = render(<Fallback />);
    expect(container.textContent).toBe("default");
  });

  test("accepts a tosijs proxy instead of a path", () => {
    const Todos = () => {
      const [todos] = useTosi(state.todos);
      return <div>{todos.map((item) => item.text).join(", ")}</div>;
    };
    const container = render(<Todos />);
    expect(container.textContent).toBe("write tests");
  });

  test("re-renders when state is changed outside React", async () => {
    const Counter = () => {
      const [count] = useTosi<number>("state.count");
      return <div>{count}</div>;
    };
    const container = render(<Counter />);
    expect(container.textContent).toBe("0");

    state.count = 17;
    await flush();
    expect(container.textContent).toBe("17");
  });

  test("setValue writes through to shared state and other observers", async () => {
    const Writer = () => {
      const [, setGreeting] = useTosi<string>("state.greeting");
      return (
        <button onClick={() => setGreeting("goodbye")}>update</button>
      );
    };
    const Reader = () => {
      const [greeting] = useTosi<string>("state.greeting");
      return <div className="reader">{greeting}</div>;
    };
    const container = render(
      <>
        <Writer />
        <Reader />
      </>,
    );
    act(() => {
      container.querySelector("button")!.click();
    });
    await flush();
    expect(state.greeting).toBe("goodbye");
    expect(container.querySelector(".reader")!.textContent).toBe("goodbye");
  });

  test("re-syncs when the observed path changes across renders", async () => {
    const Switcher = ({ path }: { path: string }) => {
      const [value] = useTosi<string>(path);
      return <div>{value}</div>;
    };
    const container = render(<Switcher path="state.first" />);
    // drain any registration touch so it can't mask a stale render
    await flush();
    expect(container.textContent).toBe("alpha");

    const root = roots[roots.length - 1];
    act(() => {
      root.render(<Switcher path="state.second" />);
    });
    // no touch on state.second — the value must come from subscribe-time sync
    expect(container.textContent).toBe("beta");
  });

  test("re-renders on in-place array mutation", async () => {
    const Todos = () => {
      const [todos] = useTosi<{ id: number; text: string }[]>("state.todos");
      return <div>{todos.map((item) => item.text).join(", ")}</div>;
    };
    const container = render(<Todos />);
    state.todos.push({ id: 99, text: "pushed in place" });
    await flush();
    expect(container.textContent).toContain("pushed in place");
  });

  test("stops observing after unmount", async () => {
    let renderCount = 0;
    const Counter = () => {
      renderCount++;
      const [count] = useTosi<number>("state.count");
      return <div>{count}</div>;
    };
    const container = render(<Counter />);
    const root = roots.pop()!;
    act(() => root.unmount());
    containers.pop()!.remove();

    const renders = renderCount;
    state.count = state.count + 1;
    await flush();
    expect(renderCount).toBe(renders);
    expect(container.textContent).toBe("");
  });

  test("function values are stored as values, not invoked as updaters", async () => {
    const fn1 = () => "first";
    const fn2 = () => "second";
    (state as any).callback = fn1;
    await flush();

    let hookValue: any;
    const FnHolder = () => {
      const [callback] = useTosi<() => string>("state.callback");
      hookValue = callback;
      return <div>{typeof callback}</div>;
    };
    const container = render(<FnHolder />);
    expect(container.textContent).toBe("function");
    expect(hookValue()).toBe("first");

    (state as any).callback = fn2;
    await flush();
    expect(hookValue()).toBe("second");
  });

  test("a function passed as initialValue is not invoked", () => {
    const fnInit = () => "initial";
    let hookValue: any;
    const FnFallback = () => {
      const [callback] = useTosi<() => string>("state.missingFn", fnInit);
      hookValue = callback;
      return <div>{typeof callback}</div>;
    };
    const container = render(<FnFallback />);
    expect(container.textContent).toBe("function");
    expect(hookValue()).toBe("initial");
  });

  test("throws when passed something that is neither path nor proxy", () => {
    // the throw is intentional — keep React's error-boundary advice and our
    // own console.error out of the test output
    const quiet = spyOn(console, "error").mockImplementation(() => {});
    try {
      const Broken = () => {
        const [value] = useTosi({ not: "a proxy" } as any);
        return <div>{String(value)}</div>;
      };
      expect(() => {
        render(<Broken />);
      }).toThrow("useTosi must either be passed a path or a tosijs proxy");
    } finally {
      quiet.mockRestore();
    }
  });

  test("useXin is a deprecated alias for useTosi", () => {
    expect(useXin).toBe(useTosi);
  });
});

describe("_resolvePathOf (tosijs ^1.0.6 compatibility shim)", () => {
  const tosi = (x: any) => "via-tosiPath";
  const xin = (x: any) => "via-xinPath";

  test("prefers tosiPath when present", () => {
    expect(_resolvePathOf({ tosiPath: tosi, xinPath: xin })).toBe(tosi);
  });

  test("falls back to xinPath on tosijs 1.0.x", () => {
    expect(_resolvePathOf({ xinPath: xin })).toBe(xin);
  });

  test("throws a clear error when neither export exists", () => {
    expect(() => _resolvePathOf({})).toThrow(
      "react-tosijs requires tosijs ^1.0.6",
    );
  });
});

describe("reactWebComponents", () => {
  test("maps camelCase property access to kebab-case custom elements", () => {
    const FooBar = reactWebComponents.fooBar;
    const container = render(<FooBar class="widget">content</FooBar>);
    const element = container.querySelector("foo-bar");
    expect(element).not.toBeNull();
    expect(element!.getAttribute("class")).toBe("widget");
    expect(element!.textContent).toBe("content");
  });

  test("returns the same component for repeated access", () => {
    expect(reactWebComponents.myThing).toBe(reactWebComponents.myThing);
  });
});
