import Sort, { swap, Comparer } from '../Sort';

const selectionSort = <T>(items: T[], compare: Comparer<T>): void => {
  const size = items.length;
  for (let i = 0; i < size - 1; i += 1) {
    let min = i;
    for (let j = i + 1; j < size; j += 1) {
      if (compare(items[j], items[min]) < 0) {
        min = j;
      }
    }

    if (min !== i) {
      swap(items, i, min);
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
