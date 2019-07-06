import flow from 'lodash/fp/flow';
import times from 'lodash/fp/times';
import shuffle from 'lodash/fp/shuffle';

export const generateRandomNumbers: (count: number) => number[] = flow(
  (count: number) => [Math.floor(98 / count), count],
  ([step, count]) => [step, count, Math.floor((100 + step - step * count) / 2)],
  ([step, count, base]) => times(index => base + index * step, count),
  items => shuffle(items),
);

export const shuffleNumbers = (items: number[]): number[] => shuffle(items);
