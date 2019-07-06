import { Runner, Comparer, defaultCompare } from '../../utils/index';
import { parentOf, heapifyUp } from './utils';

export enum MinMax { Min, Max }

export class Heap<T> extends Runner {
  protected minMax = MinMax.Min;

  protected comparer: Comparer<T>;

  protected data: T[] = [];

  public constructor({ minMax = MinMax.Min, comparer }: {
    minMax?: MinMax; comparer?: Comparer<T>;
  } = {}) {
    super();
    this.comparer = comparer || (minMax === MinMax.Max
      ? defaultCompare
      : (a, b) => -defaultCompare(a, b)
    );
  }

  public get items(): T[] {
    return this.data;
  }

  public get length(): number { return this.items.length; }

  public get isEmpty(): boolean { return !this.length; }

  protected execute(): void { this.heapify(); }

  protected heapify(): void { heapifyUp(this.items, this.comparer); }

  protected verify = () => {
    const { items, comparer: compare } = this;
    for (let child = items.length - 1; child > 0; child -= 1) {
      const parent = parentOf(child);
      if (compare(items[parent], items[child]) < 0) return false;
    }
    return true;
  }
}
