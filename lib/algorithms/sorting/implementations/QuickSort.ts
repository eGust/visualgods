import Sort, { swap } from '../Sort';

const partition = (array: any[], lo: number, hi: number): number => {
  const mid = Math.floor((hi - lo) / 2) + lo;
  const pivot = array[mid];
  for (let i = lo - 1, j = hi + 1;;) {
    do {
      i += 1;
    } while (array[i] < pivot);

    do {
      j -= 1;
    } while (array[j] > pivot);

    if (i >= j) return j;

    swap(array, i, j);
  }
};

const quicksort = (array: any[], lo: number, hi: number) => {
  if (lo < hi) {
    const p = partition(array, lo, hi);
    quicksort(array, lo, p);
    quicksort(array, p + 1, hi);
  }
}

class QuickSort extends Sort {
  execute() {
    const { data: array } = this;
    quicksort(array, 0, array.length - 1);
  }
}

export default QuickSort;
