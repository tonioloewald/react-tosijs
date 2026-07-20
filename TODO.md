# TODO

Deferred follow-ups from the v1.1.0 pre-release review (2026-07-20). Items marked
*(unverified)* were lens-reported but not adversarially verified — sanity-check before acting.

## API / types

- [ ] *(unverified)* `useTosi<T>` returns plain `T` when `initialValue` is omitted, so
  `undefined` is typed as `T`. Add useState-style overloads:
  `useTosi<T>(observed, initialValue: T): HookType<T>` /
  `useTosi<T = undefined>(observed): HookType<T | undefined>`.
- [ ] *(unverified)* `WebComponent` still advertises `className`, which renders as a dead
  `classname` attribute on custom elements under React 18. Consider
  `Omit<ComponentPropsWithRef<"div">, "className">` to steer users to `class` —
  but only after React 19 (where `className` works) is in the test matrix, since
  omitting it would fight React 19 users.
- [ ] *(unverified)* `useXin` deprecation is JSDoc-only; house rules want a warn-once runtime
  `console.warn` naming the replacement (tosijs ships `warnDeprecated` — only in newer
  versions, so guard it). Tests currently assert `useXin === useTosi` by identity and
  would need to assert delegation instead.
- [x] ~~Reimplement `useTosi` on `useSyncExternalStore`~~ — **done in 1.2.0** (snapshot
  wrapper per observer fire; closed the mount gap, path-switch stale frame, mount
  double-render, and stale-`initialValue` closure in one change).

## Testing / gating

- [ ] Add a minimal GitHub Actions CI workflow (install, build, test). `prepublishOnly`
  now gates publishes locally, but nothing gates pushes/PRs.
- [ ] Add React 19 to the test matrix (peer range now allows `^19.0.0`; the suite runs
  against 18.3 only).
- [x] ~~Add type-level tests + a `typecheck` script~~ — **done in 1.2.0**
  (`tests/types.typecheck.ts`, `tsconfig.typecheck.json`, in the prepublishOnly gate).
- [ ] Per-touch observer work is O(N) in components subscribed to the same path (each
  useTosi registers its own tosijs observer + does its own `xin[path]` resolution).
  Fine at normal scale; a shared per-path store registry would make it O(1) if a
  hot-list case ever shows up (efficiency lens lead, unverified).
- [ ] Upgrade tosijs-ui to ≥ 1.7.0 when published, drop the `tjs-lang` devDependency
  (see UPSTREAM.md — upstream fix shipped).
- [ ] *(unverified)* Add eslint flat config with `eslint-plugin-react-hooks`
  (`exhaustive-deps: error`) — the 1.0.x resubscribe bug is exactly what that rule catches
  mechanically; eslint is a devDep with no config.
- [ ] *(unverified)* Refactor the unmount test to stop reaching into the render helper's
  internal `roots`/`containers` arrays; have `render()` return `{ container, unmount }` (nit).

## From the confirmation review (2026-07-20, unverified unless noted)

Hook internals — **all resolved by the 1.2.0 `useSyncExternalStore` rewrite** except:

- [x] ~~Object-path identity churn breaks downstream memoization~~ — **measured 2026-07-20:
  largely a non-issue.** `.map()` over an observed array yields the *raw* elements
  (`mapped[0] === rawTodos[0]`), so the standard `todos.map(item => <Row item={item}/>)`
  pattern passes identity-stable objects and `memo(Row)` works. The observed container
  itself gets a new proxy identity per observer fire, but a fire means it changed —
  re-rendering a memo'd child that receives the whole container is correct behavior.
  (Direct member access through a proxy, `todosProxy[0]`, does mint fresh wrappers — by
  design, for write tracking; don't use that identity as a memo key.)
- [ ] *(unverified)* Share the createRoot/act render-and-cleanup scaffolding between the
  two test files via `tests/helpers.tsx` (must stay safe to import before `mock.module` —
  note that constraint in a doc comment).

Other:

- [x] ~~Export the hook's return tuple type~~ — **done in 1.2.0** (`HookType<T>` exported).
- [x] ~~Assert `setValue` referential stability~~ — **done in 1.2.0** (test added).
- [ ] *(unverified)* Committed `dist/` has no freshness gate — add CI
  `bun run build && git diff --exit-code dist/`, or stop committing dist and use `prepare`.
- [ ] *(unverified)* Demo bundle is ~1.15MB minified because the demo imports all of
  tosijs-ui; use per-component entry points if available (demo-site-only).
- [ ] *(unverified)* Ask on tosijs-ui: does the `tosijs-ui/site` builder support a
  bring-your-own-bundle React demo with static-asset exclusions? dev.ts hand-rolls ~120
  lines the ecosystem may already centralize.
- [ ] *(unverified)* Comment on tosijs#17 asking that the subscription seam include
  test-suitable introspection (observer count per path) so churn tests stop needing the
  `mock.module` namespace-snapshot dance.

## Docs / hygiene

- [ ] *(unverified)* README.md and `demo/static/use-tosi.md` are drifting duplicates (the
  demo site renders the latter). Single-source them: have prebuild copy README.md into
  the docs output, or scope use-tosi.md to demo-only content.
- [ ] Consider `packageManager` field / corepack story once bun supports it cleanly
  (text lockfile `bun.lock` is now in place; stale `package-lock.json` removed).

## Notes on review items intentionally not actioned

- `tjs-lang` devDep flagged *(unverified)* as unused — it is **required**: tosijs-ui's
  live-example module dynamically imports `tjs-lang/browser` and the demo build fails to
  resolve without it (verified during the 1.1.0 respin). Now filed upstream — see
  UPSTREAM.md (tosijs-ui#20).
