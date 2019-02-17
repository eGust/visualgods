import Sort, { swap } from '../Sort';
import { heapifyUp as heapify, siftDown as sift } from '../../../data-structures/heap/utils';

const heapSort = (array: any[]) => {
  heapify(array);
  for (let i = array.length - 1; i > 0; i -= 1) {
    swap(array, 0, i);
    sift(array, 0, i);
  }
};

class HeapSort extends Sort {
  execute() {
    heapSort(this.data);
  }
}

export default HeapSort;
