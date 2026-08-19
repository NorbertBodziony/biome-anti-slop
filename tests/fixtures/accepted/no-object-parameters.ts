interface SavedValue {
  readonly id: string;
}

export function save(value: SavedValue): void {
  void value;
}

export function acceptGeneric<Value extends object>(value: Value): void {
  void value;
}
