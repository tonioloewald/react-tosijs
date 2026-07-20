/**
 * Regression test for the 1.0.x resubscribe-churn bug: useTosi's effect had no
 * dependency array, so every render unsubscribed and resubscribed its tosijs
 * observer. Wraps tosijs' observe/unobserve to count calls; must be its own
 * file so the mock is registered before src/use-tosi.ts imports tosijs.
 */
import { describe, test, expect, mock } from "bun:test";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import * as tosijsNamespace from "tosijs";

// capture the real module into a plain object BEFORE mock.module so the
// factory never touches the (re-bound) mocked namespace
const real = {
  xin: tosijsNamespace.xin,
  xinProxy: tosijsNamespace.xinProxy,
  tosiPath: (tosijsNamespace as any).tosiPath,
  xinPath: (tosijsNamespace as any).xinPath,
  updates: tosijsNamespace.updates,
  observe: tosijsNamespace.observe,
  unobserve: tosijsNamespace.unobserve,
};

let observeCalls = 0;
let unobserveCalls = 0;

mock.module("tosijs", () => ({
  ...real,
  observe: (...args: any[]) => {
    observeCalls++;
    return (real.observe as any)(...args);
  },
  unobserve: (...args: any[]) => {
    unobserveCalls++;
    return (real.unobserve as any)(...args);
  },
}));

real.xinProxy({ churn: { value: "steady" } });

describe("subscription lifecycle", () => {
  test("subscribes once per path, not once per render", async () => {
    const { useTosi } = await import("../src/index");

    const Value = () => {
      const [value] = useTosi<string>("churn.value");
      return <div>{value}</div>;
    };
    const Parent = ({ generation }: { generation: number }) => (
      <div data-generation={generation}>
        <Value />
      </div>
    );

    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    act(() => {
      root.render(<Parent generation={0} />);
    });
    expect(container.textContent).toBe("steady");
    expect(observeCalls).toBe(1);
    expect(unobserveCalls).toBe(0);

    for (let generation = 1; generation <= 5; generation++) {
      act(() => {
        root.render(<Parent generation={generation} />);
      });
    }
    expect(observeCalls).toBe(1);
    expect(unobserveCalls).toBe(0);

    act(() => root.unmount());
    expect(observeCalls).toBe(1);
    expect(unobserveCalls).toBe(1);
    container.remove();
  });
});
