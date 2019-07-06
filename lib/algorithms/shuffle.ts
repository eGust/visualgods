import { swap, randomInt } from '../utils/index';

// eslint-disable-next-line arrow-parens
export const inPlace = <T>(items: T[], start: number = 0, stop: number = items.length): T[] => {
  for (let i = stop - 1; i > start; i -= 1) {
    swap(items, randomInt(i + 1, start), i);
  }
  return items;
};

// eslint-disable-next-line arrow-parens
export const duplicated = <T>(items: T[], start: number = 0, stop: number = items.length): T[] => {
  const copiedItems = [...items];
  return inPlace(copiedItems, start, stop);
};

export default inPlace;
