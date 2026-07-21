# react-tosijs

[github](https://github.com/tonioloewald/react-tosijs#readme) | [npm](https://www.npmjs.com/package/react-tosijs) | [tosijs](https://tosijs.net) | [discord](https://discord.gg/ramJ9rgky5)

**Insanely simple state management for React — and an off-ramp from React. Take your pick.**

If you just want the state management: `useTosi` works the way `useState` does, minus
the plumbing — no reducers, no providers, no prop-drilling. If you want the off-ramp
(one that otherwise basically doesn't exist): most "React state management" libraries
deepen your commitment to React, but here your state lives in [tosijs](https://tosijs.net)
— plain observable objects with no framework attached — and React becomes just one way
of looking at it. Build new functionality on a vastly superior state management system,
and migrate away from React as fast or as slowly as makes sense.

It provides two things:

- **`useTosi`** — a `useState`-shaped hook bound to a tosijs path. State can be created,
  read, and mutated *outside* React (vanilla JS, web components, the browser console) and
  React views just follow. Built on `useSyncExternalStore`, so it's concurrent-rendering
  safe.
- **`reactWebComponents`** — a proxy that turns any custom element into a React component
  (`reactWebComponents.fooBar` renders `<foo-bar>`), so web components and React
  components can coexist on the same page, bound to the same state.

## The off-ramp, step by step

1. **Move state and logic out of components** into a tosijs proxy. This works inside your
   existing React 18/19 app — no rewrite, no adapters.
2. **Components become pure views** via `useTosi`. Reducers, context plumbing, and
   prop-drilling simply stop being necessary.
3. **Build new UI as web components** ([tosijs-ui](https://ui.tosijs.net), or your own via
   tosijs `Component`), rendered inside React with `reactWebComponents`. They bind to the
   same paths as your React views — both stay in sync automatically, because neither owns
   the state.
4. **Replace remaining React views at your own pace.** When the last one goes, delete
   `react` and `react-tosijs` from package.json. Your state, logic, and new components are
   untouched — they never depended on React in the first place.

There is no step where you maintain two sources of truth, write a sync layer, or do a
big-bang rewrite.

> Worth noting: tosijs does change detection at the DOM-update seam (an unchanged bound
> value is a no-op at write time), while React requires answering "did it change?" at the
> subscription source. The bridge's internal machinery exists to pay React's toll on
> React's behalf — deleting React deletes the toll.

## useTosi in two minutes

Pass any object to `xinProxy`, then access it exactly like you would via `useState`
except using `useTosi('path.to.value')`. E.g.

```jsx
import { xinProxy } from 'tosijs'
import { useTosi } from 'react-tosijs'

const { clock } = xinProxy({
  clock: {
    time: new Date().toLocaleTimeString(),
  },
})

setInterval(() => {
  clock.time = new Date().toLocaleTimeString()
}, 1000)

const Clock = () => {
  const [time] = useTosi('clock.time')
  return <div>{time}</div>
}
```

Note that `useTosi` returns `[value, setValue]` just as `useState` does — but here the
state is updated _outside_ React and it _just works_. (You could write a more complex
self-contained `<Clock>` that sets up and tears down its own interval, but nothing about
that would be less code or faster.)

One difference from `useState`: `setValue` takes the next **value**, not an updater
function — `setCount(c => c + 1)` would store the function itself (tosijs state
legitimately holds functions, so they are never auto-invoked).

## Todo List Example

Here's the good old [React](https://react.dev) "to do list" example rewritten with `xin`
and only pure components.

- Fewer lines of code,
- Clean separation between logic and presentation,
- Better behavior, _and_
- Cleaner screen redraws (thanks to pure components)

Better, faster, cheaper. You _can_ have all three.

```jsx
import { xinProxy } from 'tosijs'
import { useTosi } from 'react-tosijs'

const { app } = xinProxy({
  app: {
    itemText: '',
    todos: [],
    addItem(event) {
      event.preventDefault() // forms reload the page by default!
      if (!app.itemText) return
      app.todos.push({
        id: crypto.randomUUID(),
        text: app.itemText,
      })
      app.itemText = ''
    },
  },
})

const Editor = () => {
  const [itemText, setItemText] = useTosi('app.itemText')
  return (
    <form onSubmit={app.addItem}>
      <input value={itemText} onInput={(event) => setItemText(event.target.value)} />
      <button disabled={!itemText} onClick={app.addItem}>
        Add Item
      </button>
    </form>
  )
}

const List = () => {
  const [todos] = useTosi('app.todos')
  return (
    <ul>
      {todos.map((item) => (
        <li key={item.id}>{item.text}</li>
      ))}
    </ul>
  )
}

const TodoApp = () => (
  <div className="TodoApp" role="main">
    <h1>To Do</h1>
    <List />
    <Editor />
  </div>
)

root.render(<TodoApp />)
```

Notice `app` is a plain observable object: `addItem` is testable without rendering
anything, the console can poke `app.todos` directly, and if `<List />` were replaced
with a web component tomorrow, `app` wouldn't change at all. That's the off-ramp.

## reactWebComponents

`reactWebComponents.fooBar` gives you a React functional component that renders
`<foo-bar>` custom elements, so you can use web components (e.g. from
[tosijs-ui](https://ui.tosijs.net)) in React without writing wrappers:

```jsx
import 'tosijs-ui'
import { reactWebComponents } from 'react-tosijs'

const Markdown = reactWebComponents.xinMd

const Doc = () => <Markdown class="doc" src="/README.md" />
```

> Note: on React 18, pass `class` (not `className`) to web components —
> React 18 sets props on custom elements as attributes verbatim. React 19
> handles `className` on custom elements natively.

## Typed paths

Paths are serializable, loggable, and framework-free — and with a state shape they're
also compile-time checked:

```ts
import { typedTosi } from 'react-tosijs'

type AppState = {
  app: { count: number; todos: { id: string; text: string }[] }
}

const { useTosi } = typedTosi<AppState>()

const [text] = useTosi('app.todos[0].text') // text: string
const [oops] = useTosi('app.cuont')         // compile error
```

`TosiPath<S>` and `TosiPathValue<S, P>` are exported for building your own typed helpers.

## Persistence

`persist` hydrates a path from storage and writes it back on every change. It's
framework-free — it works identically whether the path is rendered by React, web
components, or nothing at all:

```ts
import { persist } from 'react-tosijs'

const stop = persist('app.todos') // localStorage, key "tosijs:app.todos"
```

Writes are coalesced (one serialize + write per change flush). Durable state outlives
code: if the shape of a persisted value changes between releases, bump the `key`.

## Redux DevTools

`connectDevTools` streams path touches to the Redux DevTools extension — each touched
path becomes an action (the path string is the action type) with a raw-value snapshot
of the roots you name:

```ts
import { connectDevTools } from 'react-tosijs'

const disconnect = connectDevTools({ roots: ['app'] })
```

It's a debugging tap, not a time-travel store; it no-ops when the extension is absent.

## Compatibility

- **React** `^18.2.0 || ^19.0.0` (the hook is built on `useSyncExternalStore`).
- **tosijs** `^1.0.6` — the library uses `tosiPath` when available (tosijs ≥ 1.1) and
  falls back to `xinPath` on older versions.
- **SSR**: tosijs needs DOM globals to load, so server rendering means a DOM-shimmed
  pipeline (happy-dom, jsdom) — `renderToString` works there.

## Development

- `bun start` — build, watch, and serve the demo at http://localhost:8016
- `bun run build` — one-shot build of `dist/` (library) and `docs/` (demo site)
- `bun test` — run the test suite
