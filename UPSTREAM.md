# UPSTREAM

Workarounds in this repo for gaps in upstream projects, each mirrored to a filed issue
(per shared practices: file, don't fix — a workaround without a filed issue gets silently
absorbed forever).

## tosijs

- **Proxy identity + change-tick seam — resolved by discussion, nothing owed upstream.**
  Fresh-proxy-per-access is structural (proxies are created on access; nothing exists to
  cache), so it needs no documented guarantee — just never use proxy identity for change
  detection or memo keys. The bridge manufactures its own snapshot identity (re-wrap on
  the way through — React's identity heuristic, fed from outside). The residual
  unsubscribed-window gap is a *choice*, closable locally at any time by always-notify-
  on-subscribe for object paths (one extra mount render); 1.2.0 prefers a raw-compare
  with a narrow, self-healing miss. The change-tick seam in the issue is downgraded to a
  low-priority test-introspection nicety — maintainer may close as by-design.
  Issue: https://github.com/tonioloewald/tosijs/issues/17
- **Rename shims** — `src/use-tosi.ts` shims `tosiPath ?? xinPath` and
  `tosiValue ?? xinValue` (both spot-checked present at tosijs 1.0.6, not yet covered by
  a CI floor matrix — see TODO.md). Retire both shims together when the peer floor moves
  to ≥ 1.1.
- **DOM globals required at import** — plain-Node `import 'tosijs'` throws
  (`HTMLElement is not defined`) even for consumers using only the DOM-free state API.
  Costs here: SSR documented as DOM-shimmed-only, happy-dom preload required before
  tosijs loads in tests. Asked for a `tosijs/state` subpath export or lazy DOM-global
  access. Issue: https://github.com/tonioloewald/tosijs/issues/18
- **Framework-free extras live here deliberately** — `persist`, `connectDevTools`, and
  the path types touch no React API, but per the maintainer tosijs core doesn't need
  them (tosijs dedupes at the DOM-update seam; these serve app/bridge concerns), so they
  stay in react-tosijs rather than being hoisted. If they ever graduate to a standalone
  framework-free package, react-tosijs will keep re-exports so the move is non-breaking.
  **The second-consumer trigger has now FIRED**: ngx-tosijs (2026-07-21) duplicates all
  three modules. Graduation issue: https://github.com/tonioloewald/react-tosijs/issues/3
  Until the shared package exists, bug fixes must land in both repos (first known
  divergence to port here: ngx 0.9.1's persist guards against throwing localStorage
  getters in sandboxed iframes).

- **`tosiPath` availability** — `tosiPath` arrived in tosijs 1.1; to keep the wide `^1.0.6`
  peer range honest, `src/use-tosi.ts` shims `tosiPath ?? xinPath` (unit-tested via
  `_resolvePathOf`). No issue needed (deliberate back-compat; remove the shim when the peer
  floor moves to ≥1.1). Verified floor: tosijs@1.0.6 passed the full suite ad hoc during the
  v1.1.0 review (via the xinPath branch, fresh-proxy behavior included) — not yet covered
  by CI (see TODO.md test matrix).

## tosijs-ui

- **`tosi-md` src-path render race** — the `src` attribute change queues the initial
  render while the fetch completes asynchronously and sets `.value`, which does NOT
  trigger a re-render; if the queued render wins the race (slow fetch, e.g. CDN), the
  component stays blank forever with no error. Affects at least tosijs-ui 1.6.23–1.7.0.
  Diagnosis: `.value` is populated, manual `.render()` displays it. Workaround in both
  demo repos: fetch the markdown explicitly, set `.value`, call `.render()`.
  Issue: (to be filed — see below)

- **`tjs-lang/browser` dynamic import breaks consumer bundles** — **RESOLVED upstream**
  (fixed in tosijs-ui 1.7.0: imports made runtime-dynamic, peer range bumped, warn-once
  message when absent). Workaround here: direct `tjs-lang` devDependency — **remove it
  when this repo upgrades to tosijs-ui ≥ 1.7.0** (1.7.0 not yet on npm as of 2026-07-20).
  Issue: https://github.com/tonioloewald/tosijs-ui/issues/20 (closed)

## react

- **React 18 custom-element props** — React 18 sets props on custom elements as attributes
  verbatim, so `className` renders as a dead `classname` attribute; `reactWebComponents`
  users must pass `class`. React 19 already fixed this (`className` works natively), so no
  upstream issue was filed; the peer range now allows React 19 and the workaround is scoped
  to React 18 in docs. Resolution: adopt React 19 in the test matrix (TODO.md), then retire
  the `class` guidance.

## happy-dom

- **`.d.ts` breakage under this TS version** — happy-dom's `BrowserWindow.d.ts` references
  `node:stream/web`'s `UnderlyingDefaultSource`, which this repo's TS rejects, forcing
  `skipLibCheck: true` in `tsconfig.typecheck.json` (which blinds the typecheck gate to
  *all* dependency `.d.ts`). Remove `skipLibCheck` when a happy-dom or TS upgrade clears
  it. Not yet verified against latest happy-dom/TS — verify before filing upstream.

## bun

- **`mock.module` can't retro-wrap an already-imported module** — worked around in
  `tests/subscription-churn.test.tsx` via a cache-busting query import
  (`../src/use-tosi.ts?fresh-under-mock`). Not filed on oven-sh/bun: plausibly documented
  behavior rather than a bug — verify against bun's docs/issues before filing. Preferred
  retirement: tosijs#17's observer-introspection ask would remove the need for the mock
  entirely.

## tosijs-coding-practices

- **Doc corrections from the v1.1.0 review** (testing.md react-tosijs row, scoreboard row,
  review.md no-tags fallback, releasing.md rename checklist + static-assets trap,
  web-components.md class-vs-className):
  Issue: https://github.com/tonioloewald/tosijs-coding-practices/issues/1
