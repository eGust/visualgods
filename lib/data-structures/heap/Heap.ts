import { Runner } from '../../utils';
import { parentOf, heapifyUp } from './utils';

export enum MinMax { Min, Max }

const minComparer = (a, b) => a < b ? 1 : a > b ? -1 : 0;
const maxComparer = (a, b) => a < b ? -1 : a > b ? 1 : 0;

export class Heap extends Runner {
  minMax = MinMax.Min;

  randomize({ count = 40, low = 100, high = 200 } = {}) {
    const arr : any[] = new Array(count);
    const size = (high - low) + 1;
    for (let i = 0; i < count; i += 1) {
      arr[i] = low + (Math.random() * size | 0);
    }
    this.data = arr;
  }

  get length(): number {
    return this.data.length;
  }

  get isEmpty() {
    return !this.length;
  }

  execute() {
    heapifyUp(this.data, this.comparer);
  }

  verify = () => {
    const { data } = this;
    const compare = this.comparer;
    for (let child = data.length - 1; child > 0; child -= 1) {
      const parent = parentOf(child);
      if (compare(data[parent], data[child]) < 0) return false;
    }
    return true;
  }

  protected get comparer() {
    return this.minMax === MinMax.Min ? minComparer : maxComparer;
  }

  test() {
    this.randomize();
    this.execute();
    return this.verify();
  }
}
