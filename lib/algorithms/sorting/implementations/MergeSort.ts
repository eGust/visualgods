import Sort, { Comparer } from '../Sort';

function merge<T>(a: T[], b: T[], compare: Comparer<T>) {
  const sizeA = a.length;
  const sizeB = b.length;
  const sizeResult = sizeA + sizeB;
  const result = new Array<T>(sizeResult);
  for (let i = 0, idxA = 0, idxB = 0; i < sizeResult; i += 1) {
    if (idxA >= sizeA) {
      result[i] = b[idxB];
      idxB += 1;
    } else if (idxB >= sizeB) {
      result[i] = a[idxA];
      idxA += 1;
    } else if (compare(a[idxA], b[idxB]) <= 0) {
      result[i] = a[idxA];
      idxA += 1;
    } else {
      result[i] = b[idxB];
      idxB += 1;
    }
  }
  return result;
}

function mergeSort<T>(items: T[], compare: Comparer<T>, start = 0, end = items.length): T[] {
  const size = end - start;
  if (size <= 1) return items.slice(start, end);

  // eslint-disable-next-line no-bitwise
  const mid = start + (size / 2 | 0);
  return merge(
    mergeSort(items, compare, start, mid),
    mergeSort(items, compare, mid, end),
    compare,
  );
}

class MergeSort<T> extends Sort<T> {
  public sort() {
    const { items, compare } = this;
    this.data = mergeSort(items, compare);
  }
}

export default MergeSort;
