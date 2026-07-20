import { HookType } from "./use-tosi";
/**
 * Template-literal typing for tosijs paths. A path is serializable,
 * loggable, and framework-free — these types add the one thing selector
 * closures had over them: compile-time checking.
 */
type Scalar = string | number | boolean | null | undefined | ((...args: any[]) => any);
type ArrayIndex = `[${number}]` | `[id=${string}]`;
type SubPath<T> = T extends Scalar ? never : T extends Array<any> ? never : {
    [K in keyof T & string]: T[K] extends Scalar ? K : T[K] extends Array<infer E> ? K | `${K}${ArrayIndex}` | (E extends Scalar ? never : `${K}${ArrayIndex}.${SubPath<E>}`) : K | `${K}.${SubPath<T[K]>}`;
}[keyof T & string];
/** All valid observation paths into a state shape S */
export type TosiPath<S> = SubPath<S>;
type ElementOf<A> = A extends Array<infer E> ? E : never;
/** The value type at path P within state shape S */
export type TosiPathValue<T, P extends string> = P extends `${infer Head}.${infer Rest}` ? TosiPathValue<TosiPathValue<T, Head>, Rest> : P extends `${infer K}[${string}]` ? ElementOf<TosiPathValue<T, K>> : P extends keyof T ? T[P] : never;
/**
 * A typed facade over useTosi for a known state shape:
 *
 *   type AppState = { app: { count: number, todos: { id: string, text: string }[] } }
 *   const { useTosi } = typedTosi<AppState>()
 *   const [text] = useTosi('app.todos[0].text')  // string; typos are compile errors
 */
export declare const typedTosi: <S extends object>() => {
    useTosi: <P extends TosiPath<S> & string>(path: P, initialValue?: TosiPathValue<S, P>) => HookType<TosiPathValue<S, P>>;
};
export {};
