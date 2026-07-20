# UPSTREAM

Workarounds in this repo for gaps in upstream projects, each mirrored to a filed issue
(per shared practices: file, don't fix — a workaround without a filed issue gets silently
absorbed forever).

## tosijs

- **Proxy-identity coupling** — `useTosi`'s re-rendering after in-place mutations depends on
  tosijs minting a fresh Proxy per `xin[path]` access (verified:
  `Object.is(xin[p], xin[p]) === false`), which is undocumented and could change as a perf
  optimization. Asked for a documented guarantee or a `useSyncExternalStore`-friendly seam
  (per-path change tick / subscribe+getSnapshot).
  Issue: https://github.com/tonioloewald/tosijs/issues/17
  Local mitigation tracked in TODO.md (reimplement on `useSyncExternalStore`).

- **`tosiPath` availability** — `tosiPath` arrived in tosijs 1.1; to keep the wide `^1.0.6`
  peer range honest, `src/use-tosi.ts` shims `tosiPath ?? xinPath` via a namespace import.
  No issue needed (deliberate back-compat, remove the shim when the peer floor moves to ≥1.1).

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
