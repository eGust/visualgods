import Sort, { swap, Comparer } from '../Sort';

function insertionSort<T>(items: T[], compare: Comparer<T>) {
  const size = items.length;
  for (let i = 1; i < size; i += 1) {
    for (let j = i; j > 0 && compare(items[j - 1], items[j]) > 0; j -= 1) {
      swap(items, j, j - 1);
    }
  }
}

class InsertionSort<T> extends Sort<T> {
  sort() {
    const { items, compare } = this;
    insertionSort(items, compare);
  }
}

export default InsertionSort;
