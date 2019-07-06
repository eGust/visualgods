import Sort, { Comparer } from '../Sort';

const GAPS = [701, 301, 132, 57, 23, 10, 4, 1];

/* eslint-disable no-param-reassign, arrow-parens */
const shellSort = <T>(items: T[], compare: Comparer<T>) => {
  const n = items.length;
  GAPS.forEach((gap) => {
    for (let i = gap; i < n; i += 1) {
      const temp = items[i];
      let j: number;
      for (j = i; j >= gap && compare(items[j - gap], temp) > 0; j -= gap) {
        items[j] = items[j - gap];
      }
      items[j] = temp;
    }
  });
};
/* eslint-enable no-param-reassign, arrow-parens */

class ShellSort<T> extends Sort<T> {
  public sort() {
    const { items, compare } = this;
    shellSort(items, compare);
  }
}

export default ShellSort;
