import React from 'react';

import { storiesOf } from '@storybook/react';
import { number, select } from '@storybook/addon-knobs';
// import { action } from '@storybook/addon-actions';
// import { linkTo } from '@storybook/addon-links';

import ValueBox from '../src/components/ValueBox';
import { ItemStatus, ItemHighlight } from '../src/components/common_types';

storiesOf('Components', module)
  .add('ValueBox', () => (
    <ValueBox
      value={number('value', 256)}
      status={select(
        'status', {
          [ItemStatus.Normal]: ItemStatus.Normal,
          [ItemStatus.Creating]: ItemStatus.Creating,
          [ItemStatus.Deleting]: ItemStatus.Deleting,
          [ItemStatus.Updating]: ItemStatus.Updating,
          [ItemStatus.Selected]: ItemStatus.Selected,
        },
        ItemStatus.Normal,
      )}
      highlight={ItemHighlight.Medium}
    />
  ));
