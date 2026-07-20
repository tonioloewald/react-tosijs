/**
 * SSR smoke test: tosijs needs DOM globals to import at all, so "SSR" for
 * this library means a DOM-shimmed pipeline (like this happy-dom preload).
 * useSyncExternalStore requires getServerSnapshot for renderToString —
 * regression coverage for the 1.2.0 rewrite.
 */
import { describe, test, expect } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";
import { xinProxy } from "tosijs";
import { useTosi } from "../src/index";

xinProxy({ ssrState: { message: "hello from the server" } });

describe("server rendering", () => {
  test("renderToString works", () => {
    const Message = () => {
      const [message] = useTosi<string>("ssrState.message");
      return <div>{message}</div>;
    };
    const html = renderToString(<Message />);
    expect(html).toContain("hello from the server");
  });

  test("renderToString falls back to initialValue on empty paths", () => {
    const Fallback = () => {
      const [value] = useTosi<string>("ssrState.missing", "fallback");
      return <div>{value}</div>;
    };
    expect(renderToString(<Fallback />)).toContain("fallback");
  });
});
