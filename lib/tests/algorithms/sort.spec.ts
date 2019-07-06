import { env } from 'process';
import times from 'lodash/fp/times';

import * as sorters from '../../algorithms/sorting/index';
import { defaultCompare } from '../../utils/index';

const {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  default: _Sorter,
  ...Sorters
} = sorters;

const generateRandomNumbers = ({ count = 50, low = 100, high = 999 }): number[] => {
  const numbers: number[] = [];
  const size = (high - low) + 1;
  for (let i = 0; i < count; i += 1) {
    // eslint-disable-next-line no-bitwise
    numbers[i] = low + (Math.random() * size | 0);
  }
  return numbers;
};

const TIMES = 2;
const RANGE = {
  count: (+env.TEST_SAMPLE_SIZE) || 100,
  low: (+env.TEST_SAMPLE_RANGE_LOW) || 100,
  high: (+env.TEST_SAMPLE_RANGE_HIGH) || 999,
};

const generateTest = (index: number): void => {
  describe(`Sort - round ${index + 1}`, () => {
    const rawNumbers = generateRandomNumbers(RANGE);
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
};

times(generateTest)((+env.TEST_TIMES) || TIMES);
