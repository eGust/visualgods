import { Runner, defaultCompare, Comparer } from '../../utils';

export { swap, Comparer } from '../../utils';

export default class Sort<T> extends Runner {
  compare: Comparer<T>;

  constructor(comparer: Comparer<T> = defaultCompare) {
    super();
    this.compare = comparer;
  }

  get items(): T[] {
    return this.data;
  }

  execute() {
    this.sort();
  }

  sort() {}

  randomize({ count = 40, low = 100, high = 200 } = {}) {
    const arr = new Array<number>(count);
    const size = (high - low) + 1;
    for (let i = 0; i < count; i += 1) {
      arr[i] = low + (Math.random() * size | 0);
    }
    this.data = arr;
  }

  verify = () => {
    const { items } = this;
    const array = [...items];
    return JSON.stringify(array.sort(this.compare)) === JSON.stringify(items);
  }
}
