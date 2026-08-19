declare const owner: object;
declare const key: string;
export const value = Reflect.get(owner, key);

