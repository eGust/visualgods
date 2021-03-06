import Sort, {
  BubbleSort,
  HeapSort,
  InsertionSort,
  MergeSort,
  QuickSort,
  ShellSort,
  SelectionSort,
} from '../../../lib/algorithms/sorting/index';
import { Comparer } from '../../../lib/utils/index';
import { NumberItem } from '../types';

const comparer: Comparer<NumberItem> = (a, b) => {
  const r = a.value - b.value;
  return Math.sign(r);
};

const sorters: Record<string, Sort<NumberItem>> = {
  bubble: new BubbleSort<NumberItem>(comparer),
  heap: new HeapSort<NumberItem>(comparer),
  insertion: new InsertionSort<NumberItem>(comparer),
  merge: new MergeSort<NumberItem>(comparer),
  quick: new QuickSort<NumberItem>(comparer),
  shell: new ShellSort<NumberItem>(comparer),
  selection: new SelectionSort<NumberItem>(comparer),
};

type SortParams = Readonly<{ task: number; items: NumberItem[] }>;

type Sorter = (params: SortParams) => { task: number; sorted: NumberItem[] };

const buildSorter = (sorter: Sort<NumberItem>): Sorter => ({ task, items }: SortParams) => {
  // eslint-disable-next-line no-param-reassign
  sorter.items = items.map(item => Object.freeze(item));
  sorter.sort();
  return { task, sorted: sorter.items };
};

const createSort = (): Record<string, Sorter> => {
  const r: Record<string, Sorter> = {};
  Object.entries(sorters).forEach(([key, sorter]) => {
    r[key] = buildSorter(sorter);
  });
  return r;
};

export default createSort();
