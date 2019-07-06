import Sort, { swap, Comparer } from '../Sort';

// eslint-disable-next-line arrow-parens
const selectionSort = <T>(items: T[], compare: Comparer<T>): void => {
  const size = items.length;
  for (let j = 0; j < size - 1; j += 1) {
    let iMin = j;
    for (let i = j; i < size; i += 1) {
      if (compare(items[i], items[iMin]) < 0) {
        iMin = i;
      }
    }

    if (iMin !== j) {
      swap(items, j, iMin);
    }
  }
};

class SelectionSort<T> extends Sort<T> {
  public sort(): void {
    const { items, compare } = this;
    selectionSort(items, compare);
  }
}

export default SelectionSort;
