import Sort, { swap } from '../Sort';

const selectionSort = (array: any[]) => {
  const size = array.length;
  for (let j = 0; j < size - 1; j += 1) {
    let idxMin = j;
    for (let i = j + 1; i < size; i += 1) {
      if (array[i] < array[idxMin]) {
        idxMin = i;
      }
    }

    if (idxMin !== j) {
      swap(array, j, idxMin);
    }
  }
};

class SelectionSort extends Sort {
  execute() {
    selectionSort(this.data);
  }
}

export default SelectionSort;
