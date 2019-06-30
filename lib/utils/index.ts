export abstract class Runner {
  protected abstract data: any;

  protected verify: () => boolean = () => true;

  protected dump() {
    return JSON.stringify(this.data);
  }

  protected load(json: string) {
    this.data = JSON.parse(json);
  }
}

export type Runnable = Runner | { new(): Runner };

/**
 * Swap two element in an array
 *
 * @param {T[]} list `array` array to swap
 * @param {number} i `integer` index 1
 * @param {number} j `integer` index 2
 * @returns {T[]} `array` the same array
 */
/* eslint-disable no-param-reassign */
export function swap<T>(list: T[], i: number, j: number): T[] {
  if (i === j) return list;

  const t = list[i];
  list[i] = list[j];
  list[j] = t;
  return list;
}
/* eslint-enable no-param-reassign */

export type Comparer<T> = (a: T, b: T) => number;

export function defaultCompare<T>(a: T, b: T) {
  if (a < b) return -1;
  if (a > b) return +1;
  return 0;
}

/**
 * Generate random integer between `lo` and `hi`
 *
 * @param {integer} hi `integer` high exclusive boundary
 * @param {integer} [lo=0] `integer` low inclusive boundary
 * @returns {integer} `integer`
 */
export function randomInt(hi: number, lo: number = 0): number {
  return Math.floor(Math.random() * (hi - lo)) + lo;
}
