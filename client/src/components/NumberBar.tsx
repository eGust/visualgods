import React from 'react';
import styled from '@emotion/styled';
// import { useSpring, animated } from 'react-spring';

import { ValueRecord, ItemStatus } from './common_types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;

  font-size: 20px;

  width: 40px;
  height: 520px;
`;

interface BarProps {
  size: number;
}

const Bar = styled.div<BarProps>`
  width: 38.2%;
  height: ${({ size }) => size}px;

  border-width: 1px;
  border-style: solid;
  border-radius: 8px 8px 0 0;
  margin: 3px 5px;
`;

const NumberBar = (props: ValueRecord<number>) => {
  // const style = useSpring({ opacity: 1, from: { opacity: 0 } });
  const { value, status } = props;
  return (
    <Container>
      {value}
      <Bar className={`${status || ItemStatus.Normal}-status`.toLowerCase()} size={value * 5} />
    </Container>
  );
};

export default NumberBar;
