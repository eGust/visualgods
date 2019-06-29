import Sort, {
  BubbleSort,
  HeapSort,
  InsertionSort,
  MergeSort,
  QuickSort,
  ShellSort,
  SelectionSort,
} from '../../../algorithms/sorting/index';
import { Comparer } from '../../../utils/index';
import { NumberItem } from '../types';

const comparer: Comparer<NumberItem> = (a, b) => a.value - b.value;

const sorters = {
  bubble: new BubbleSort<NumberItem>(comparer),
  heap: new HeapSort<NumberItem>(comparer),
  insertion: new InsertionSort<NumberItem>(comparer),
  merge: new MergeSort<NumberItem>(comparer),
  quick: new QuickSort<NumberItem>(comparer),
  shell: new ShellSort<NumberItem>(comparer),
  selection: new SelectionSort<NumberItem>(comparer),
};

type Sorter = (params: { task: number; items: NumberItem[] }) =>
{ task: number; sorted: NumberItem[] };

function buildSorter(sorter: Sort<NumberItem>): Sorter {
  return ({ task, items }) => {
    sorter.items = items; // eslint-disable-line no-param-reassign
    sorter.sort();
    return { task, sorted: sorter.items };
  };
}

function createSort() {
  const r: Record<string, Sorter> = {};
  Object.entries(sorters).forEach(([key, sorter]) => {
    r[key] = buildSorter(sorter);
  });
  return r;
}

export default createSort();
