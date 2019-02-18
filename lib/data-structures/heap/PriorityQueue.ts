import { Heap } from './Heap';
import { siftDown, siftUp } from './utils';

export default class PriorityQueue extends Heap {
  push(item: any) {
    const { data: list } = this;
    list.push(item);
    siftUp(list, 0, list.length, this.comparer);
  }

  pop(): any {
    const { data: list } = this;
    if (!list.length) return null;

    const result = list[0];
    const last = list.pop();
    if (list.length) {
      list[0] = last;
      siftDown(list, 0, list.length, this.comparer);
    }
    return result;
  }

  peek(): any {
    const { data: list } = this;
    return list.length ? list[0] : null;
  }
}
