# react-tosijs

[github](https://github.com/tonioloewald/react-tosijs#readme) | [npm](https://www.npmjs.com/package/react-tosijs) | [tosijs](https://tosijs.net) | [discord](https://discord.gg/ramJ9rgky5)

Incredibly simple, powerful, and efficient state management for React…

`useTosi` leverages [React hooks](https://react.dev/reference/react/hooks) to
make managing application state incredibly simple. No more passing data down through
the virtual DOM hierarchy, and needing to reroute data or write reducers.

[sandbox example](https://codesandbox.io/s/xinjs-react-reminders-demo-v0-4-2-l46k52?file=/src/App.tsx)

> This is an old example that uses `xinjs` and `react-xinjs`. `xinjs` has since been renamed `tosijs`
> (and `react-xinjs` is now `react-tosijs`).

`useTosi` allows you to use `xin` to manage state in [React](https://react.dev) apps.

- work with pure components everywhere (use `useTosi` the way you'd use `useState`)
- cleanly separate logic from presentation
- avoid code and performance "tax" of passing complex state through DOM hierarchies
- cleanly integrate react and non-react code without writing and maintaining wrappers

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

One difference from `useState`: `setValue` takes the next **value**, not an
updater function — `setCount(c => c + 1)` would store the function itself
(tosijs state legitimately holds functions, so they are never auto-invoked).

Note that `useTosi` returns `[value, setValue]` just as `useState` does
(and if you wanted to write a more complex self-contained `<Clock>` that
sets up and tears down setInterval then nothing is stopping you except
wanting to write less, simpler code that runs faster), but in
this case the state is being updated _outside_ of React and it _just works_.

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

## Development

- `bun start` — build, watch, and serve the demo at http://localhost:8016
- `bun run build` — one-shot build of `dist/` (library) and `docs/` (demo site)
- `bun test` — run the test suite
