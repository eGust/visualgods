export class Runner {
  data: any;

  verify: () => boolean = null;

  dump() {
    return JSON.stringify(this.data);
  }

  load(json: string) {
    this.data = JSON.parse(json);
  }
}

export type Runnable = Runner | { new(): Runner };

/* eslint-disable no-param-reassign */
export const swap = (list: any[], i: number, j: number) => {
  const t = list[i];
  list[i] = list[j];
  list[j] = t;
};
/* eslint-enable no-param-reassign */

export type Comparer<T> = (a: T, b: T) => number;

export function defaultCompare<T>(a: T, b: T) {
  if (a < b) return -1;
  if (a > b) return +1;
  return 0;
}
