import {
  Sort,
  BubbleSort,
  HeapSort,
  InsertionSort,
  MergeSort,
  QuickSort,
  SelectionSort,
} from '.';

type Sorter<T> = { new(): Sort<T> };

const getFunctionName = <T>(ctor: T) => {
  const full = ctor.toString();
  return full.match(/function\s+(\w+)\(/)[1];
}

function testSort(Sorter: Sorter<Number>) {
  const sorter = new Sorter();
  sorter.randomize();
  sorter.sort();
  return { [getFunctionName(Sorter)]: sorter.verify() };
}

export default () => [
    BubbleSort,
    HeapSort,
    InsertionSort,
    MergeSort,
    QuickSort,
    SelectionSort,
  ].map(testSort).reduce((all, result) => ({ ...all, ...result }), {});
