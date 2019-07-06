import Sort, { swap, Comparer } from '../Sort';

// eslint-disable-next-line arrow-parens
const insertionSort = <T>(items: T[], compare: Comparer<T>): void => {
  const size = items.length;
  for (let i = 1; i < size; i += 1) {
    for (let j = i; j > 0 && compare(items[j - 1], items[j]) > 0; j -= 1) {
      swap(items, j, j - 1);
    }
  }
};

class InsertionSort<T> extends Sort<T> {
  public sort(): void {
    const { items, compare } = this;
    insertionSort(items, compare);
  }
}

export default InsertionSort;
