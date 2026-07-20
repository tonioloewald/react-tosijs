# UPSTREAM

Workarounds in this repo for gaps in upstream projects, each mirrored to a filed issue
(per shared practices: file, don't fix — a workaround without a filed issue gets silently
absorbed forever).

## tosijs

- **Proxy identity** — tosijs mints a fresh Proxy per `xin[path]` access. Per the
  maintainer this is deliberate and permanent (proxies are wafer-thin wrappers on a
  string; caching them would buy nothing), so it's a design property, not a risk — the
  remaining value of the filed issue is simply documenting the guarantee. As of 1.2.0
  `useTosi` no longer depends on it anyway: the `useSyncExternalStore` snapshot wrapper
  manufactures its own identity change per observer fire.
  Issue: https://github.com/tonioloewald/tosijs/issues/17

- **`tosiPath` availability** — `tosiPath` arrived in tosijs 1.1; to keep the wide `^1.0.6`
  peer range honest, `src/use-tosi.ts` shims `tosiPath ?? xinPath` (unit-tested via
  `_resolvePathOf`). No issue needed (deliberate back-compat; remove the shim when the peer
  floor moves to ≥1.1). Verified floor: tosijs@1.0.6 passed the full suite ad hoc during the
  v1.1.0 review (via the xinPath branch, fresh-proxy behavior included) — not yet covered
  by CI (see TODO.md test matrix).

## tosijs-ui

- **`tjs-lang/browser` dynamic import breaks consumer bundles** — bundling any demo that
  imports tosijs-ui fails to resolve `tjs-lang/browser` (from the live-example module) unless
  the consumer hand-installs `tjs-lang`; the error is unactionable and the optional-peer
  range (`^0.9.0`) is stale. Workaround here: direct `tjs-lang` devDependency.
  Issue: https://github.com/tonioloewald/tosijs-ui/issues/20

## react

- **React 18 custom-element props** — React 18 sets props on custom elements as attributes
  verbatim, so `className` renders as a dead `classname` attribute; `reactWebComponents`
  users must pass `class`. React 19 already fixed this (`className` works natively), so no
  upstream issue was filed; the peer range now allows React 19 and the workaround is scoped
  to React 18 in docs. Resolution: adopt React 19 in the test matrix (TODO.md), then retire
  the `class` guidance.

## tosijs-coding-practices

- **Doc corrections from the v1.1.0 review** (testing.md react-tosijs row, scoreboard row,
  review.md no-tags fallback, releasing.md rename checklist + static-assets trap,
  web-components.md class-vs-className):
  Issue: https://github.com/tonioloewald/tosijs-coding-practices/issues/1
