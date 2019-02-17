import { swap } from '../../utils';

const COMPARER = (a, b) => a < b ? -1 : a > b ? 1 : 0;

type Comparer = (a: any, b: any) => number;

export const parentOf = (n: number) => (n - 1) / 2 | 0;
export const leftChildOf = (n: number) => n * 2 + 1;
export const rightChildOf = (n: number) => (n + 1) * 2;

export const siftDown = (list: any[], start: number, end: number, compare: Comparer = COMPARER) => {
  let parent = start;
  let child = leftChildOf(parent);
  const last = end - 1;
  while (child <= last) {
    if (child < last && compare(list[child], list[child + 1]) < 0) {
      child += 1;
    }

    if (compare(list[parent], list[child]) >= 0) return;

    swap(list, parent, child);
    parent = child;
    child = leftChildOf(parent);
  }
};

export const heapifyDown = (list: any[], comparer: Comparer = COMPARER) => {
  const size = list.length;
  for (let i = parentOf(size - 1); i >= 0; i -= 1) {
    siftDown(list, i, size, comparer);
  }
};

export const siftUp = (list: any[], start: number, end: number, compare: Comparer = COMPARER) => {
  for (let child = end - 1; child > start;) {
    const parent = parentOf(child);
    if (compare(list[parent], list[child]) >= 0) return;

    swap(list, parent, child);
    child = parent;
  }
};

export const heapifyUp = (list: any[], comparer: Comparer = COMPARER) => {
  const size = list.length;
  for (let i = 2; i <= size; i += 1) {
    siftUp(list, 0, i, comparer);
  }
};
