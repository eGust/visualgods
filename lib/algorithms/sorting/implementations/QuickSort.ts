import Sort, { swap, Comparer } from '../Sort';

const partition = <T>(items: T[], lo: number, hi: number, compare: Comparer<T>): number => {
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
};

const quickSort = <T>(items: T[], lo: number, hi: number, compare: Comparer<T>): void => {
  if (lo < hi) {
    const p = partition(items, lo, hi, compare);
    quickSort(items, lo, p, compare);
    quickSort(items, p + 1, hi, compare);
  }
};

class QuickSort<T> extends Sort<T> {
  public sort(): void {
    const { items, compare } = this;
    quickSort(items, 0, items.length - 1, compare);
  }
}

export default QuickSort;
