export interface User {
  id: string;
}
export function loadUser(): User {
  return { id: "user-1" };
}

