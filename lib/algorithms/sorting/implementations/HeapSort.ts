import Sort, { swap, Comparer } from '../Sort';
import { heapifyUp as heapify, siftDown } from '../../../data-structures/heap/utils';

function heapSort<T>(items: T[], comparer: Comparer<T>) {
  heapify(items, comparer);
  for (let i = items.length - 1; i > 0; i -= 1) {
    swap(items, 0, i);
    siftDown(items, 0, i);
  }
}

class HeapSort<T> extends Sort<T> {
  sort() {
    const { items, compare } = this;
    heapSort(items, compare);
  }
}

export default HeapSort;
