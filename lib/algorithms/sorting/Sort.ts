import { Runner, defaultCompare, Comparer } from '../../utils/index';

export { swap, Comparer } from '../../utils/index';

export default abstract class Sort<T> extends Runner {
  compare: Comparer<T>;

  constructor(comparer: Comparer<T> = defaultCompare) {
    super();
    this.compare = comparer;
  }

  get items(): T[] {
    return this.data;
  }

  set items(value: T[]) {
    this.data = value;
  }

  abstract sort(): void;
}
