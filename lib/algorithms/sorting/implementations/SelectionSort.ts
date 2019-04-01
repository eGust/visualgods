import Sort, { swap, Comparer } from '../Sort';

function selectionSort<T>(items: T[], compare: Comparer<T>) {
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
}

class SelectionSort<T> extends Sort<T> {
  sort() {
    const { items, compare } = this;
    selectionSort(items, compare);
  }
}

export default SelectionSort;
