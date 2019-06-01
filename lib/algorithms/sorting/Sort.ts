import { Runner, defaultCompare, Comparer } from '../../utils/index';

export { swap, Comparer } from '../../utils/index';

export default abstract class Sort<T> extends Runner {
  protected compare: Comparer<T>;

  public constructor(comparer: Comparer<T> = defaultCompare) {
    super();
    this.compare = comparer;
  }

  public get items(): T[] {
    return this.data;
  }

  public set items(value: T[]) {
    this.data = value;
  }

  public abstract sort(): void;
}
