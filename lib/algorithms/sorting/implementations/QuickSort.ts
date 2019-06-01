import Sort, { swap, Comparer } from '../Sort';

function partition<T>(items: T[], lo: number, hi: number, compare: Comparer<T>): number {
  const mid = Math.floor((hi - lo) / 2) + lo;
  const pivot = items[mid];
  for (let i = lo - 1, j = hi + 1; ;) {
    do {
      i += 1;
    } while (compare(items[i], pivot) < 0);

    do {
      j -= 1;
    } while (compare(items[j], pivot) > 0);

    if (i >= j) return j;

    swap(items, i, j);
  }
}

function quicksort<T>(items: T[], lo: number, hi: number, compare: Comparer<T>) {
  if (lo < hi) {
    const p = partition(items, lo, hi, compare);
    quicksort(items, lo, p, compare);
    quicksort(items, p + 1, hi, compare);
  }
}

class QuickSort<T> extends Sort<T> {
  public sort() {
    const { items, compare } = this;
    quicksort(items, 0, items.length - 1, compare);
  }
}

export default QuickSort;
