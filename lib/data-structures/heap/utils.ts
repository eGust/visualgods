import { swap, Comparer, defaultCompare } from '../../utils/index';

// eslint-disable-next-line no-bitwise
export const parentOf = (n: number) => (n - 1) / 2 | 0;
export const leftChildOf = (n: number) => n * 2 + 1;
export const rightChildOf = (n: number) => (n + 1) * 2;

// eslint-disable-next-line arrow-parens
export const siftDown = <T>(
  list: T[],
  start: number,
  end: number,
  compare: Comparer<T> = defaultCompare,
) => {
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

// eslint-disable-next-line arrow-parens
export const heapifyDown = <T>(list: T[], comparer: Comparer<T> = defaultCompare) => {
  const size = list.length;
  for (let i = parentOf(size - 1); i >= 0; i -= 1) {
    siftDown(list, i, size, comparer);
  }
};

// eslint-disable-next-line arrow-parens
export const siftUp = <T>(
  list: T[],
  start: number,
  end: number,
  compare: Comparer<T> = defaultCompare,
) => {
  for (let child = end - 1; child > start;) {
    const parent = parentOf(child);
    if (compare(list[parent], list[child]) >= 0) return;

    swap(list, parent, child);
    child = parent;
  }
};

// eslint-disable-next-line arrow-parens
export const heapifyUp = <T>(list: T[], comparer: Comparer<T> = defaultCompare) => {
  const size = list.length;
  for (let i = 2; i <= size; i += 1) {
    siftUp(list, 0, i, comparer);
  }
};
