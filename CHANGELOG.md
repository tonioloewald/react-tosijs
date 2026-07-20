# Changelog

## 1.2.0 (2026-07-20)

### Changed

- **`useTosi` reimplemented on `useSyncExternalStore`.** No API change; behavioral
  improvements:
  - concurrent-rendering safe (no tearing);
  - switching the observed path across renders updates the value in the *same* render
    (previously one commit could pair the new path with the old value);
  - exactly one render on mount (previously object paths double-rendered);
  - a tosijs flush landing before the hook subscribes (delayed passive effects, React 19
    `<Activity hidden>`) is caught by a subscribe-time re-sync on raw values — the one
    residual gap, an *in-place* mutation flushed pre-subscribe, is undetectable without
    a change-tick seam in tosijs (tosijs#17);
  - DOM-shimmed SSR/prerender (`renderToString`) works — `getServerSnapshot` is provided;
  - a changed `initialValue` is used by later reads (it becomes visible on the next touch
    of the path);
  - no-op touches on primitive paths no longer re-render; touches on object- and
    function-valued paths always propagate (in-place mutation preserves identity, so
    they can't be deduped).
- The hook no longer relies on tosijs proxy identity to detect in-place mutations — it
  manufactures its own snapshot identity per observer fire. (Fresh-proxy-per-access is a
  deliberate tosijs property regardless; proxies are wafer-thin and never cached.)
- `HookType<T>` is now exported so consumers can name the return tuple.
- `"sideEffects": false` for bundler tree-shaking.
- README repositioned around the actual use case: an off-ramp from React — state and
  logic live in framework-free tosijs, and apps can migrate from React views to web
  components incrementally, with no sync layer and no big-bang rewrite.

### Added

- **Typed paths**: `typedTosi<AppState>()` returns a `useTosi` whose paths are
  compile-time checked via template-literal types (`TosiPath<S>`, `TosiPathValue<S, P>`
  exported for building your own helpers).
- **`persist(path, options?)`** — hydrate a path from storage and write it back on
  change (framework-free; returns a stop function).
- **`connectDevTools({ roots })`** — stream path touches to the Redux DevTools
  extension as path-labelled actions with raw-value snapshots.
- `bun run typecheck` (type-level tests included) — now part of the `prepublishOnly`
  gate alongside tests and build.
- Tests for the new guarantees: store-contract (mount-gap re-sync), SSR smoke, object-
  and function-path propagation, `initialValue` semantics, StrictMode, single mount
  render, `setValue` stability, persist, and DevTools (35 tests total).

## 1.1.0 (2026-07-20)

### Fixed

- `useTosi` no longer resubscribes to tosijs on every render — the observer effect
  is keyed on the observed path.
- `useTosi` re-syncs its value when the observed path changes across renders
  (previously a component switching paths, e.g. `` useTosi(`app.todos[id=${selectedId}]`) ``,
  kept rendering the old path's value until the new path was next touched).
- Function values stored in state are no longer invoked as React updaters.
- The demo bundle is now minified.

### Changed

- **Repo renamed**: `react-xinjs` → `react-tosijs` on GitHub (matching the earlier
  `xinjs` → `tosijs` package rename); `repository.url` updated (closes #2). The old npm
  packages (`react-xinjs`, `xinjs`, `xinjs-ui`) are deprecated with pointers to their
  successors. Update your remotes if you have a clone.
- React peer dependency widened to `^18.2.0 || ^19.0.0`.
- tosijs peer dependency remains `^1.0.6` — the library now uses `tosiPath` when
  available (tosijs ≥ 1.1) and falls back to `xinPath` on older versions, so no
  tosijs upgrade is forced. Development and testing target tosijs 1.6.x.
- `initialValue` is now optional, matching documented usage.
- `useXin` is deprecated (it remains as an alias) — use `useTosi`.
- The `WebComponent` type accepts a `class` prop; on React 18 custom elements need
  `class` rather than `className` (React 18 sets props on custom elements as
  attributes verbatim; React 19 handles `className` natively).

### Added

- Test suite (`bun test`, happy-dom): 18 tests covering value reads, initial-value
  fallback, proxy arguments, external mutation, cross-component writes, path
  switching, function values (stored, never invoked), subscription lifecycle (no
  resubscribe churn), unmount cleanup, the tosijs `^1.0.6` compatibility shim, and
  `reactWebComponents`.
- `bun run build` — one-shot build (previously the only option was the watch server).
- `prepublishOnly` gate: tests + build run before any `npm publish`.
