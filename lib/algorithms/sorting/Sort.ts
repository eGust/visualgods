import { Runner } from '../../utils';
export { swap } from '../../utils';

export default class Sort extends Runner {
  randomize({ count = 40, low = 100, high = 200 } = {}) {
    const arr : any[] = new Array(count);
    const size = (high - low) + 1;
    for (let i = 0; i < count; i += 1) {
      arr[i] = low + (Math.random() * size | 0);
    }
    this.data = arr;
  }

  verify = () => {
    const { data } = this;
    const array = [...data];
    return JSON.stringify(array.sort()) === JSON.stringify(data);
  }
}
