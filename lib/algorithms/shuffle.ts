import { swap, randomInt } from '../utils/index';

export function inPlace<T>(items: T[], start: number = 0, stop: number = items.length): T[] {
  for (let i = stop - 1; i > start; i -= 1) {
    swap(items, randomInt(i + 1, start), i);
  }
  return items;
}

export function duplicated<T>(items: T[], start: number = 0, stop: number = items.length): T[] {
  return inPlace([...items], start, stop);
}

export default inPlace;
