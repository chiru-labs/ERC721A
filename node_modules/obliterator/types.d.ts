export interface Sequence<T> {
  length: number;
  slice(from: number, to?: number): Sequence<T>;
  [index: number]: T;
}

export type IntoInterator<T> = Iterable<T> | Iterator<T> | Sequence<T>;
