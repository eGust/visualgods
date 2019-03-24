import sortTests from './algorithms/sorting/tests';

const tests = [sortTests];

(() => {
  tests.forEach((test) => console.log(test()));
})();
