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

// capture the FULL real module into a plain object BEFORE mock.module —
// the factory must never touch the (re-bound) mocked namespace (bun
// deadlocks), and the mock must re-export everything because it leaks
// into test files that run later in the same process
const real: any = {};
for (const key of Object.keys(tosijsNamespace)) {
  real[key] = (tosijsNamespace as any)[key];
}

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
