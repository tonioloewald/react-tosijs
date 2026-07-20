# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Shared practices

Read `AGENTS.md` first. It links the shared engineering practices for all tosijs projects at
https://github.com/tonioloewald/tosijs-coding-practices (checked out locally at
`../tosijs-coding-practices` when present). Those docs are the baseline; this file and
`AGENTS.md` record only project-specific divergences and win on conflict.

## What this is

`react-tosijs` — a tiny React bridge for tosijs state management, published as ESM with
`react` and `tosijs` as peer dependencies. The GitHub repo was renamed `react-xinjs` →
`react-tosijs` in July 2026 (the local folder may still carry the old name; `xinjs` itself
was renamed `tosijs`). The entire public API lives in `src/use-tosi.ts`:

- `useTosi(pathOrProxy, initialValue?)` — a `useState`-shaped hook (`[value, setValue]`)
  backed by the global `xin` proxy. It resolves its argument to a tosijs path, subscribes via
  `observe`/`unobserve` in a `useEffect` keyed on the path, and writes through `xin[path]`.
  State can be mutated outside React and components re-render. `useXin` is a deprecated
  back-compat alias.
- `reactWebComponents` — a Proxy that turns camelCase property access (e.g. `.xinLottie`)
  into a React function component rendering the corresponding kebab-case custom element
  (`<xin-lottie>`), for using web components (e.g. `tosijs-ui`) from React without wrappers.
  Note: on React 18, custom elements need `class`, not `className` (React sets props on
  custom elements as attributes verbatim).

`src/index.ts` just re-exports `use-tosi.ts` and `version.ts`.

## Commands

- `bun start` (runs `bun dev.ts`) — build + watch + serve the demo at http://localhost:8016.
- `bun run build` (runs `bun dev.ts --build`) — one-shot build, then exits.
- `bun test` — bun test runner; tests live in `tests/`, DOM comes from happy-dom via the
  preload in `bunfig.toml` (`tests/setup.ts` registers globals and sets
  `IS_REACT_ACT_ENVIRONMENT`). Run a single file with `bun test tests/use-tosi.test.tsx`.

There is no lint/format script (eslint/prettier are devDeps only).

## Build system (dev.ts)

`dev.ts` is a hand-rolled Bun build/watch/serve pipeline. Key facts:

- **Generated, do not hand-edit:** `dist/` (library build), `docs/` (demo site — wiped and
  regenerated on every demo change), and `src/version.ts` (rewritten from the `package.json`
  version on prebuild).
- Demo sources live in `demo/src/` (built to `docs/`); static demo assets live in
  `demo/static/` (copied into `docs/`). To change anything under `docs/`, edit `demo/` instead.
- Library build: `src/index.ts` → `dist/` as ESM with `tosijs` and `react` external;
  declarations come from `tsc --emitDeclarationOnly`.
- Watching: changes under `src/` trigger a rebuild; changes under `demo/` trigger a full
  prebuild (which wipes `docs/` and `dist/`).
- The demo imports the library by its package name via the `"react-tosijs": "file:."` devDep.
- Tests are kept out of the library build by living in `tests/` (outside tsconfig `include`).

## Naming

Because of the xinjs → tosijs rename, both naming schemes appear in tosijs itself (e.g.
`xin` proxy, `xinProxy`, `XinTouchableType` are all still current API; `xinPath`/`xinValue`
are deprecated in favor of `tosiPath`/`tosiValue`). Prefer `tosi`/`tosijs` names in new code
and docs when a current tosijs export offers them; keep the `useXin` alias for compatibility.
