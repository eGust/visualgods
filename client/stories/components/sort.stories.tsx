import React from 'react';
import flow from 'lodash/fp/flow';
import times from 'lodash/fp/times';
import shuffle from 'lodash/fp/shuffle';
import styled from '@emotion/styled';
import { createSelector } from 'reselect';

import { storiesOf } from '@storybook/react';
import { number, select } from '@storybook/addon-knobs';

import ValueBox from '../../src/components/basic/ValueBox';
import NumberBar from '../../src/components/basic/NumberBar';
import { ItemStatus, ItemHighlight } from '../../src/components/basic/common_types';

const generateRandomItems = flow(
  (count: number) => [Math.floor(98 / count), count],
  ([step, count]) => [step, count, Math.floor((100 + step - step * count) / 2)],
  ([step, count, base]) => times(index => base + index * step, count),
  items => shuffle(items),
);

const Container = styled.div`
  display: flex;
`;

const itemsSelector = createSelector(
  ({ count: n }: { count: number }) => n,
  generateRandomItems,
);

storiesOf('Components.Sort', module)
  .add('Box', () => {
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
    const items = itemsSelector({ count });
    return (
      <Container>
        {
          items.map(value => (
            <ValueBox
              key={value}
              value={value}
              status={status}
              highlight={ItemHighlight.Medium}
            />
          ))
        }
      </Container>
    );
  })
  .add('Bar', () => {
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
    const items = itemsSelector({ count });
    return (
      <Container>
        {
          items.map(value => (
            <NumberBar
              key={value}
              value={value}
              status={status}
              highlight={ItemHighlight.Medium}
            />
          ))
        }
      </Container>
    );
  });
