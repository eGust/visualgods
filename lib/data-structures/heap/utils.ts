import { swap, Comparer, defaultCompare } from '../../utils/index';

// eslint-disable-next-line no-bitwise
export const parentOf = (n: number): number => (n - 1) / 2 | 0;
export const leftChildOf = (n: number): number => n * 2 + 1;
export const rightChildOf = (n: number): number => (n + 1) * 2;

// eslint-disable-next-line arrow-parens
export const siftDown = <T>(items: T[], start: number, end: number, compare: Comparer<T> = defaultCompare): void => {
  let parent = start;
  let child = leftChildOf(parent);
  const last = end - 1;
  while (child <= last) {
    if (child < last && compare(items[child], items[child + 1]) < 0) {
      child += 1;
    }

    if (compare(items[parent], items[child]) >= 0) return;

    swap(items, parent, child);
    parent = child;
    child = leftChildOf(parent);
  }
};

// eslint-disable-next-line arrow-parens
export const heapifyDown = <T>(items: T[], comparer: Comparer<T> = defaultCompare): void => {
  const size = items.length;
  for (let i = parentOf(size - 1); i >= 0; i -= 1) {
    siftDown(items, i, size, comparer);
  }
};

// eslint-disable-next-line arrow-parens
export const siftUp = <T>(items: T[], start: number, end: number, compare: Comparer<T> = defaultCompare): void => {
  for (let child = end - 1; child > start;) {
    const parent = parentOf(child);
    if (compare(items[parent], items[child]) >= 0) return;

    swap(items, parent, child);
    child = parent;
  }
};

// eslint-disable-next-line arrow-parens
export const heapifyUp = <T>(items: T[], comparer: Comparer<T> = defaultCompare): void => {
  const size = items.length;
  for (let i = 2; i <= size; i += 1) {
    siftUp(items, 0, i, comparer);
  }
};
