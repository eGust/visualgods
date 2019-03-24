import { Runner, Comparer, defaultCompare } from '../../utils';
import { parentOf, heapifyUp } from './utils';

export enum MinMax { Min, Max }

export class Heap<T> extends Runner {
  minMax = MinMax.Min;
  comparer: Comparer<T>;

  constructor({ minMax = MinMax.Min, comparer }: { minMax?: MinMax, comparer?: Comparer<T> } = {}) {
    super();
    this.comparer = comparer || (minMax == MinMax.Max ? defaultCompare : (a, b) => -defaultCompare(a, b));
  }

  randomize({ count = 40, low = 100, high = 200 } = {}) {
    const arr = new Array<number>(count);
    const size = (high - low) + 1;
    for (let i = 0; i < count; i += 1) {
      arr[i] = low + (Math.random() * size | 0);
    }
    this.data = arr;
  }

  get items(): T[] {
    return this.data;
  }

  get length() {
    return this.items.length;
  }

  get isEmpty() {
    return !this.length;
  }

  execute() {
    this.heapify();
  }

  heapify() {
    heapifyUp(this.items, this.comparer);
  }

  verify = () => {
    const { items, comparer: compare } = this;
    for (let child = items.length - 1; child > 0; child -= 1) {
      const parent = parentOf(child);
      if (compare(items[parent], items[child]) < 0) return false;
    }
    return true;
  }

  test() {
    this.randomize();
    this.execute();
    return this.verify();
  }
}
