import Sort from './Sort';

type Sorter<T> = { new(): Sort<T> };

const getFunctionName = <T>(ctor: T) => {
  const full = ctor.toString();
  return full.match(/function\s+(\w+)\(/)[1];
}

export default (Sorter: Sorter<Number>) => {
  const sorter = new Sorter();
  sorter.randomize();
  sorter.sort();
  return { [getFunctionName(Sorter)]: sorter.verify() };
}
