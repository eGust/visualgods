import Sort, { swap } from '../Sort';

const merge = (a: any[], b: any[]) => {
  const sizeA = a.length;
  const sizeB = b.length;
  const sizeResult = sizeA + sizeB;
  const result = new Array(sizeResult);
  for (let i = 0, idxA = 0, idxB = 0; i < sizeResult; i += 1) {
    if (idxA >= sizeA) {
      result[i] = b[idxB];
      idxB += 1;
    } else if (idxB >= sizeB) {
      result[i] = a[idxA];
      idxA += 1;
    } else if (a[idxA] <= b[idxB]) {
      result[i] = a[idxA];
      idxA += 1;
    } else {
      result[i] = b[idxB];
      idxB += 1;
    }
  }
  return result;
}

const mergeSort = (array: any[], start = 0, end = array.length): any[] => {
  const size = end - start;
  if (size <= 1) return array.slice(start, end);

  const mid = start + (size / 2 | 0);
  return merge(
    mergeSort(array, start, mid),
    mergeSort(array, mid, end),
  );
};

class MergeSort extends Sort {
  execute() {
    this.data = mergeSort(this.data);
  }
}

export default MergeSort;
