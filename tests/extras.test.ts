import { describe, test, expect, afterEach } from "bun:test";
import { xinProxy, updates } from "tosijs";
import { persist, connectDevTools } from "../src/index";

const { persisted } = xinProxy({
  persisted: { count: 1, label: "hello" },
  devtooled: { clicks: 0 },
});

const makeFakeStorage = (seed: Record<string, string> = {}) => {
  const data = new Map(Object.entries(seed));
  return {
    data,
    getItem: (key: string) => (data.has(key) ? data.get(key)! : null),
    setItem: (key: string, value: string) => void data.set(key, value),
  };
};

afterEach(() => {
  delete (globalThis as any).__REDUX_DEVTOOLS_EXTENSION__;
});

describe("persist", () => {
  test("writes changes to storage as raw JSON", async () => {
    const storage = makeFakeStorage();
    const stop = persist("persisted.count", { storage });
    persisted.count = 42;
    await updates();
    expect(storage.data.get("tosijs:persisted.count")).toBe("42");
    stop();
    persisted.count = 43;
    await updates();
    expect(storage.data.get("tosijs:persisted.count")).toBe("42");
  });

  test("hydrates from storage on connect", () => {
    const storage = makeFakeStorage({ "custom-key": '"stored"' });
    const stop = persist("persisted.label", { storage, key: "custom-key" });
    expect(persisted.label).toBe("stored");
    stop();
  });

  test("ignores unparseable stored values", () => {
    const storage = makeFakeStorage({ "tosijs:persisted.label": "not json {" });
    const before = String(persisted.label);
    const stop = persist("persisted.label", { storage });
    expect(String(persisted.label)).toBe(before);
    stop();
  });

  test("throws on a non-path argument", () => {
    expect(() => persist({ not: "a proxy" } as any)).toThrow(
      "persist must be passed a path or a tosijs proxy",
    );
  });
});

describe("connectDevTools", () => {
  test("no-ops without the extension", () => {
    const disconnect = connectDevTools({ roots: ["devtooled"] });
    expect(typeof disconnect).toBe("function");
    disconnect();
  });

  test("sends path-labelled actions with raw snapshots", async () => {
    const sent: Array<{ action: any; state: any }> = [];
    let inited: any = null;
    (globalThis as any).__REDUX_DEVTOOLS_EXTENSION__ = {
      connect: () => ({
        init: (state: any) => (inited = state),
        send: (action: any, state: any) => sent.push({ action, state }),
      }),
    };
    const disconnect = connectDevTools({ name: "test", roots: ["devtooled"] });
    expect(inited.devtooled.clicks).toBe(0);

    const { xin } = await import("tosijs");
    xin["devtooled.clicks"] = 7;
    await updates();

    expect(sent.length).toBeGreaterThan(0);
    const last = sent[sent.length - 1];
    expect(last.action.type).toBe("devtooled.clicks");
    expect(last.state.devtooled.clicks).toBe(7);

    // touches outside the declared roots are filtered
    const before = sent.length;
    xin["persisted.count"] = 99;
    await updates();
    expect(sent.length).toBe(before);
    disconnect();
  });
});
