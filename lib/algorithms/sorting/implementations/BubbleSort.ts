import Sort, { swap, Comparer } from '../Sort';

function bubbleSort<T>(items: T[], compare: Comparer<T>) {
  const n = items.length;
  let swapped: boolean;
  do {
    swapped = false;
    for (let i = 1; i < n; i += 1) {
      if (compare(items[i - 1], items[i]) > 0) {
        swap(items, i - 1, i);
        swapped = true;
      }
    }
  } while (swapped);
}

class BubbleSort<T> extends Sort<T> {
  public sort() {
    const { items, compare } = this;
    bubbleSort(items, compare);
  }
}

export default BubbleSort;
