/**
 * Type-level tests: never executed, only compiled — `bun run typecheck`.
 * The .typecheck.ts suffix keeps bun test from running this file.
 */
import { typedTosi, TosiPath, TosiPathValue, HookType } from "../src/index";

type AppState = {
  app: {
    count: number;
    title: string;
    todos: { id: string; text: string; done: boolean }[];
    settings: { theme: { dark: boolean } };
  };
};

// valid paths compile
const p1: TosiPath<AppState> = "app.count";
const p2: TosiPath<AppState> = "app.todos";
const p3: TosiPath<AppState> = "app.todos[0].text";
const p4: TosiPath<AppState> = "app.todos[id=abc].done";
const p5: TosiPath<AppState> = "app.settings.theme.dark";
// keyed lookups accept any key property, not just id
const p6: TosiPath<AppState> = "app.todos[text=milk].done";

// @ts-expect-error — typo in a key
const bad1: TosiPath<AppState> = "app.cuont";
// @ts-expect-error — typo in a nested key
const bad2: TosiPath<AppState> = "app.todos[0].txet";
// @ts-expect-error — nonexistent root
const bad3: TosiPath<AppState> = "application.count";

// path values resolve
const v1: TosiPathValue<AppState, "app.count"> = 42;
const v2: TosiPathValue<AppState, "app.todos[0].text"> = "hi";
const v3: TosiPathValue<AppState, "app.settings.theme.dark"> = true;
// bracket lookups can miss, so they admit undefined
const v4: TosiPathValue<AppState, "app.todos[0]"> = undefined;
const v5: TosiPathValue<AppState, "app.todos[id=x]"> = { id: "x", text: "", done: false };
// @ts-expect-error — number path yields number, not string
const badValue: TosiPathValue<AppState, "app.count"> = "not a number";
// @ts-expect-error — non-bracket paths do NOT admit undefined
const badDefined: TosiPathValue<AppState, "app.count"> = undefined;

// the typed facade infers hook tuples
const { useTosi } = typedTosi<AppState>();
declare const hooked: ReturnType<typeof useTosi<"app.title">>;
const hookedValue: string = hooked[0];
const hookedSetter: (next: string) => void = hooked[1];

// HookType is exported and nameable
const named: HookType<number> = [1, (_n: number) => {}];

// silence unused-variable noise
void [p1, p2, p3, p4, p5, p6, bad1, bad2, bad3, v1, v2, v3, v4, v5, badValue, badDefined, hookedValue, hookedSetter, named];
