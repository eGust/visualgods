export * from './runner';

export const swap = (list: any[], i: number, j: number) => {
  const t = list[i];
  list[i] = list[j];
  list[j] = t;
}

export type Comparer<T> = (a: T, b: T) => number;

export function defaultCompare<T>(a: T, b: T) {
  if (a < b) return -1;
  if (a > b) return +1;
  return 0;
}
