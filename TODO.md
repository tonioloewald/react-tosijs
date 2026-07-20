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
- [ ] Reimplement `useTosi` on `useSyncExternalStore` with a version-counter snapshot —
  removes the dependency on tosijs minting fresh proxies per access (see UPSTREAM.md)
  and closes the mount-to-effect missed-update window.

## Testing / gating

- [ ] Add a minimal GitHub Actions CI workflow (install, build, test). `prepublishOnly`
  now gates publishes locally, but nothing gates pushes/PRs.
- [ ] Add React 19 to the test matrix (peer range now allows `^19.0.0`; the suite runs
  against 18.3 only).
- [ ] *(unverified)* Add `tests/use-tosi.types.ts` + a `typecheck` script — `tests/` is outside
  tsconfig `include`, so public-type changes (optional initialValue, `class?`, generics)
  are never typechecked.
- [ ] *(unverified)* Add eslint flat config with `eslint-plugin-react-hooks`
  (`exhaustive-deps: error`) — the 1.0.x resubscribe bug is exactly what that rule catches
  mechanically; eslint is a devDep with no config.
- [ ] *(unverified)* Refactor the unmount test to stop reaching into the render helper's
  internal `roots`/`containers` arrays; have `render()` return `{ container, unmount }` (nit).

## Docs / hygiene

- [ ] *(unverified)* README.md and `demo/static/use-tosi.md` are drifting duplicates (the
  demo site renders the latter). Single-source them: have prebuild copy README.md into
  the docs output, or scope use-tosi.md to demo-only content.
- [ ] Consider `packageManager` field / corepack story once bun supports it cleanly
  (text lockfile `bun.lock` is now in place; stale `package-lock.json` removed).

## Notes on review items intentionally not actioned

- `tjs-lang` devDep flagged *(unverified)* as unused — it is **required**: tosijs-ui's
  live-example module dynamically imports `tjs-lang/browser` and the demo build fails to
  resolve without it (verified during the 1.1.0 respin).
