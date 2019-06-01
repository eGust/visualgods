export class Runner {
  protected data: any;

  protected verify: () => boolean = null;

  protected dump() {
    return JSON.stringify(this.data);
  }

  protected load(json: string) {
    this.data = JSON.parse(json);
  }
}

export type Runnable = Runner | { new(): Runner };

/* eslint-disable no-param-reassign */
export function swap<T>(list: T[], i: number, j: number) {
  const t = list[i];
  list[i] = list[j];
  list[j] = t;
}
/* eslint-enable no-param-reassign */

export type Comparer<T> = (a: T, b: T) => number;

export function defaultCompare<T>(a: T, b: T) {
  if (a < b) return -1;
  if (a > b) return +1;
  return 0;
}
