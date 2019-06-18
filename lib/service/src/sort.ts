import Sort, {
  BubbleSort,
  HeapSort,
  InsertionSort,
  MergeSort,
  QuickSort,
  ShellSort,
  SelectionSort,
} from '../../algorithms/sorting/index';
import { Comparer } from '../../utils/index';
import { NumberItem } from './types';

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

export default (sortMethod: string, items: NumberItem[]) => {
  const sorter = sorters[sortMethod] as Sort<NumberItem>;
  sorter.items = items;
  sorter.sort();
  return sorter.items;
};
