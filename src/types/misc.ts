export type Nullable<T> = T | null | undefined

/** 
 * Extracts the resolved type of a Promise:
 *   type Foo = AwaitedPromise<Promise<number>> // number 
 */
export type AwaitedPromise<T> = T extends Promise<infer R> ? R : never