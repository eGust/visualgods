import * as sorters from '../../algorithms/sorting/index';
import { defaultCompare } from '../../utils/index';

const {
  default: Sort,
  ...Sorters
} = sorters;

function generateRandomNumbers({ count = 50, low = 100, high = 999 }) {
  const numbers = new Array<number>(count);
  const size = (high - low) + 1;
  for (let i = 0; i < count; i += 1) {
    numbers[i] = low + (Math.random() * size | 0);
  }
  return numbers;
}

[1, 2, 3].forEach((id) => {
  describe(`Sort - round ${id}`, () => {
    const rawNumbers = generateRandomNumbers({
      count: 1000,
      low: 10000,
      high: 99999,
    });
    const sorted = [...rawNumbers].sort(defaultCompare);
    Object.entries(Sorters).forEach(([sortName, Sorter]) => {
      test(sortName, () => {
        const sort = new Sorter();
        sort.items = [...rawNumbers];
        sort.sort();
        expect(sort.items).toEqual(sorted);
      });
    });
  });
});
