/* eslint-disable no-param-reassign, no-restricted-syntax, no-continue */
import Sort, { Comparer } from '../Sort';

const GAPS = [701, 301, 132, 57, 23, 10, 4, 1];

const shellSort = <T>(items: T[], compare: Comparer<T>): void => {
  for (const gap of GAPS) {
    if (gap >= items.length) continue;

    for (let i = gap; i < items.length; i += 1) {
      const temp = items[i];
      let j: number;
      for (j = i; j >= gap && compare(items[j - gap], temp) > 0; j -= gap) {
        items[j] = items[j - gap];
      }
      items[j] = temp;
    }
  }
};

class ShellSort<T> extends Sort<T> {
  public sort(): void {
    const { items, compare } = this;
    shellSort(items, compare);
  }
}

export default ShellSort;
