import { RunnerHelper } from './utils';
import { HeapSort } from './algorithms/sorting';

(() => {
  const runner = new RunnerHelper(HeapSort);
  runner.run();
})();
