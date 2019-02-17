import Sort, { swap } from '../Sort';

const insertionSort = (array: any[]) => {
  const size = array.length;
  for (let i = 1; i < size; i += 1) {
    for (let j = i; j > 0 && array[j - 1] > array[j]; j -= 1) {
      swap(array, j, j - 1);
    }
  }
};

class InsertionSort extends Sort {
  execute() {
    insertionSort(this.data);
  }
}

export default InsertionSort;
