import testSort from './tester';
import {
  BubbleSort,
  HeapSort,
  InsertionSort,
  MergeSort,
  QuickSort,
  SelectionSort,
} from '.';

export default () => [
    BubbleSort,
    HeapSort,
    InsertionSort,
    MergeSort,
    QuickSort,
    SelectionSort,
  ].map(testSort).reduce((all, result) => ({ ...all, ...result }), {});
