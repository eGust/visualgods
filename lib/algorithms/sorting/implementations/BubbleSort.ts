import Sort, { swap } from '../Sort';

const bubbleSort = (array: any[]) => {
  let n = array.length;
  let swapped: boolean;
  do {
    swapped = false;
    for (let i = 1; i < n; i += 1) {
      if (array[i - 1] > array[i]) {
        swap(array, i - 1, i);
        swapped = true;
      }
    }
  } while(swapped);
};

class BubbleSort extends Sort {
  execute() {
    bubbleSort(this.data);
  }
}

export default BubbleSort;
