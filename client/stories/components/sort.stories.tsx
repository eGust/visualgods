import React, { useState } from 'react';
import flow from 'lodash/fp/flow';
import times from 'lodash/fp/times';
import shuffle from 'lodash/fp/shuffle';
import styled from '@emotion/styled';
import { createSelector } from 'reselect';

import { storiesOf } from '@storybook/react';
import { number, select } from '@storybook/addon-knobs';

import { ValueRecord, ItemStatus, ItemHighlight } from '../../src/components/basic/common_types';
import ValueBox from '../../src/components/basic/ValueBox';
import NumberBar from '../../src/components/basic/NumberBar';
import QuickSort from '../../../lib/algorithms/sorting/implementations/QuickSort';

interface NumberItem {
  value: number;
  index: number;
}

interface SortValueComponentProps {
  count: number;
  status: ItemStatus;
  Component: (props: ValueRecord<number>) => JSX.Element;
}

const generateRandomItems: (count: number) => NumberItem[] = flow(
  (count: number) => [Math.floor(98 / count), count],
  ([step, count]) => [step, count, Math.floor((100 + step - step * count) / 2)],
  ([step, count, base]) => times(index => ({ value: base + index * step, index }), count),
  items => shuffle(items),
);

const Container = styled.div`
  display: flex;
`;

const itemsSelector = createSelector(
  ({ count: n }: { count: number }) => n,
  generateRandomItems,
);

const compareItem = ({ value: v1 }: NumberItem, { value: v2 }: NumberItem) => v1 - v2;
const sorter = new QuickSort(compareItem);

const SortValueComponent = ({ count, status, Component }: SortValueComponentProps) => {
  const [items, setItems] = useState(itemsSelector({ count }));
  return (
    <div>
      <Container>
        {
          items.map(({ value, index }) => (
            <Component
              key={index}
              value={value}
              status={status}
              highlight={ItemHighlight.Medium}
            />
          ))
        }
      </Container>
      <span>
        <button
          type="button"
          onClick={() => {
            sorter.items = [...items];
            sorter.sort();
            setItems([...sorter.items]);
          }}
        >
          Sort
        </button>
        <button
          type="button"
          onClick={() => {
            setItems(itemsSelector({ count }));
          }}
        >
          Reload
        </button>
      </span>
    </div>
  );
};

const buildComponent = (Component: (props: ValueRecord<number>) => JSX.Element) => () => {
  const count = number('count', 24);
  const status = select(
    'status', {
      [ItemStatus.Normal]: ItemStatus.Normal,
      [ItemStatus.Creating]: ItemStatus.Creating,
      [ItemStatus.Deleting]: ItemStatus.Deleting,
      [ItemStatus.Updating]: ItemStatus.Updating,
      [ItemStatus.Selected]: ItemStatus.Selected,
    },
    ItemStatus.Normal,
  );
  return (<SortValueComponent {...{ count, status, Component }} />);
};

storiesOf('Components.Sort', module)
  .add('Box', buildComponent(ValueBox))
  .add('Bar', buildComponent(NumberBar));
