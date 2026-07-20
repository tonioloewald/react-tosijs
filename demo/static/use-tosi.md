# react-tosijs

[github](https://github.com/tonioloewald/react-tosijs#readme) | [npm](https://www.npmjs.com/package/react-tosijs) | [tosijs](https://tosijs.net) | [discord](https://discord.gg/ramJ9rgky5)

This is a tiny module that integrates tosijs with [React](https://react.dev) — and, more
to the point, provides **an off-ramp from React**: your state and logic live in tosijs
(no framework attached), React becomes just one way of viewing it, and you can replace
React views with web components — bound to the same state — as fast or as slowly as makes
sense. No sync layer, no big-bang rewrite.

It provides two very useful things:

## `useTosi()`

`useTosi` allows you to use [tosijs](https://tosijs.net) as your state management system for React
elements. This is insanely simpler than dealing with hooks and providers, allows
you to integrate code libraries with React without complex adapters, and just makes
life better in general.

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

All this is accomplished with, basically, no custom code. And it's performant (try turning on render flashing).

> It's widely estimated that 70% of the code in React apps is simply moving data to and from the UI. With
> `tosijs` managing state it's a _lot_ less.

## `reactWebComponents` proxy

`reactWebComponents.fooBar` gives you a react functional component for generating
`<foo-bar>` elements. Since [tosijs](https://tosijs.net) makes it super easy to create web-components,
and provides a library [tosijs-ui](https://ui.tosijs.net) with lots of useful web-components, and also
lets you use [tosijs blueprints](https://tosijs.net/?blueprint-loader.ts) to dynamically load web-components as needed,
this is a Very Good Thing™.

[demo/src/index.tsx](https://github.com/tonioloewald/react-tosijs/blob/main/demo/src/index.tsx) shows how you can
turn web components (both lottie animation component at the top of the demo and the markdown component
that is rendering this text) into React functional components using the `reactWebComponents` proxy.

> Note: on React 18, pass `class` (not `className`) to web components — React 18 sets props
> on custom elements as attributes verbatim. React 19 handles `className` natively.

`react-tosijs` is copyright ©2023-2026 Tonio Loewald
