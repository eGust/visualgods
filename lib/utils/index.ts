export * from './runner';

export const swap = (list: any[], i: number, j: number) => {
  const t = list[i];
  list[i] = list[j];
  list[j] = t;
}
