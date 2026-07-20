# Changelog

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
  `xinjs` → `tosijs` package rename). Update your remotes if you have a clone.
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

- Test suite (`bun test`, happy-dom): 13 tests covering value reads, initial-value
  fallback, proxy arguments, external mutation, cross-component writes, path
  switching, subscription lifecycle (no resubscribe churn), unmount cleanup, and
  `reactWebComponents`.
- `bun run build` — one-shot build (previously the only option was the watch server).
- `prepublishOnly` gate: tests + build run before any `npm publish`.
