declare const operation: (...args: unknown[]) => unknown;
declare const owner: object;
declare const args: unknown[];
export const value = Reflect.apply(operation, owner, args);

