# react-tosijs

[github](https://github.com/tonioloewald/react-tosijs#readme) | [npm](https://www.npmjs.com/package/react-tosijs) | [tosijs](https://tosijs.net) | [discord](https://discord.gg/ramJ9rgky5)

**An off-ramp from React — one that otherwise basically doesn't exist.**

Your state and logic live in [tosijs](https://tosijs.net) — plain observable objects with
no framework attached — and React becomes just one way of viewing them. Build new
functionality on a vastly superior state management system, replace React views with web
components bound to the same state as fast or as slowly as makes sense, and when the last
React view goes, delete React. No sync layer, no big-bang rewrite. (Or don't migrate at
all: it's also simply the easiest state management you'll ever use in a React app.)

This page **is** the demo: the Reminders app above is React rendered by `useTosi`, the
mascot and this very document are web components rendered through `reactWebComponents`,
and all of it binds to the same framework-free state.

It provides two core things — `useTosi()` and the `reactWebComponents` proxy — plus
three framework-free extras: `typedTosi<AppState>()` (compile-time-checked paths),
`persist()` (storage sync), and `connectDevTools()` (Redux DevTools tap). See the
[README](https://github.com/tonioloewald/react-tosijs#readme) for the extras; the core
two are below.

## `useTosi()`

`useTosi` is a `useState`-shaped hook bound to a [tosijs](https://tosijs.net) path. The
state it reads doesn't belong to React — it's a plain object that vanilla JS, web
components, or the browser console can mutate, and the React views just follow. That's
what makes it an off-ramp: nothing about your model ever needs to know React exists.

The **Reminders** demo, [demo/src/todo.tsx](https://github.com/tonioloewald/react-tosijs/blob/main/demo/src/todo.tsx),
shows how you can sync state between a vanilla js model and pure functional components using `useTosi()`.

You can also go into your browser's console and see the `app` proxy that is synced to the React UI elements
in this demo. In the console, try something like:

```
app.name = "hello tosijs"
```

Or if you're feeling adventurous you can directly create or modify the todo list items, e.g.:

```
app.todos.push({
  id: Math.random(),
  reminder: 'try building an app with tosijs'
})
```

You can even create a todo item and then modify the text of the item directly:

```
// assuming there is a reminder to modify you
app.todos[0].reminder = 'look I changed ya'
```

Notice what just happened: you drove a React UI from outside React, with no custom code.
And it's performant (try turning on render flashing).

> It's widely estimated that 70% of the code in React apps is simply moving data to and from the UI. With
> `tosijs` managing state it's a _lot_ less — and none of what remains is coupled to React.

## `reactWebComponents` proxy

This is the other half of the off-ramp. `reactWebComponents.fooBar` gives you a react
functional component for generating `<foo-bar>` elements, so web components and React
components coexist on the same page, bound to the same state. Since
[tosijs](https://tosijs.net) makes it super easy to create web-components, provides a
library [tosijs-ui](https://ui.tosijs.net) with lots of useful web-components, and also
lets you use [tosijs blueprints](https://tosijs.net/?blueprint-loader.ts) to dynamically
load web-components as needed, each new piece of UI you build this way is one you'll
keep when React goes — and until then, React hosts it happily.

[demo/src/index.tsx](https://github.com/tonioloewald/react-tosijs/blob/main/demo/src/index.tsx) shows how you can
turn web components (both the lottie animation component at the top of the demo and the markdown component
that is rendering this text) into React functional components using the `reactWebComponents` proxy.

> Note: on React 18, pass `class` (not `className`) to web components — React 18 sets props
> on custom elements as attributes verbatim. React 19 handles `className` natively.

`react-tosijs` is copyright ©2023-2026 Tonio Loewald
