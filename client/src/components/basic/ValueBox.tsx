import React from 'react';
import styled from '@emotion/styled';
// import { useSpring, animated } from 'react-spring';

import {
  ValueRecord,
  ValueType,
} from './common_types';

const Box = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 20px;
  width: 50px;
  height: 36px;

  border-width: 1px;
  border-style: solid;
  border-radius: 8px;
  margin: 3px;
`;

function ValueBox<T extends ValueType>(props: ValueRecord<T>) {
  // const style = useSpring({ opacity: 1, from: { opacity: 0 } });
  const { value, status } = props;
  return (
    <Box className={`${status}-status`.toLowerCase()}>
      {value}
    </Box>
  );
}

export default ValueBox;
