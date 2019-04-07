import React from 'react';

import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
// import { action } from '@storybook/addon-actions';
// import { linkTo } from '@storybook/addon-links';

import Foo from '../src/components/Foo';

storiesOf('Welcome', module)
  .add('to Storybook', () => (
    <Foo message={text('message', 'Test Message')} />
  ));
