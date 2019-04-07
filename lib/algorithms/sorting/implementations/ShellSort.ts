import Sort, { swap, Comparer } from '../Sort';

const GAPS = [701, 301, 132, 57, 23, 10, 4, 1];

function shellSort<T>(items: T[], compare: Comparer<T>) {
  const n = items.length;
  GAPS.forEach((gap) => {
    for (let i = gap; i < n; i += 1) {
      const temp = items[i];
      let j : number;
      for (j = i; j >= gap && compare(items[j - gap], temp) > 0; j -= gap) {
        items[j] = items[j - gap];
      }
      items[j] = temp;
    }
  });
}

class ShellSort<T> extends Sort<T> {
  sort() {
    const { items, compare } = this;
    shellSort(items, compare);
  }
}

export default ShellSort;
