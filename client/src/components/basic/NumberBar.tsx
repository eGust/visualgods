import React from 'react';
import styled from '@emotion/styled';
// import { useSpring, animated } from 'react-spring';

import { ValueRecord } from './common_types';

interface NumberBar extends ValueRecord<number> {}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;

  font-size: 20px;

  width: 40px;
  height: 540px;
`;

const Bar = styled.div`
  width: 38.2%;
  height: ${({ value }: { value: number }) => value * 5}px;

  border-width: 1px;
  border-style: solid;
  border-radius: 8px 8px 0 0;
  margin: 3px 5px;
`;

function NumberBar(props: NumberBar) {
  // const style = useSpring({ opacity: 1, from: { opacity: 0 } });
  const { value, status } = props;
  return (
    <Container>
      {value}
      <Bar className={`${status}-status`.toLowerCase()} value={value} />
    </Container>
  );
}

export default NumberBar;
