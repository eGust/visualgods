import React from 'react';
import { useSpring, animated } from 'react-spring';

function Foo({ message } : { message: String }) {
  const style = useSpring({ opacity: 1, from: { opacity: 0 } });
  return (
    <animated.div style={style}>
      {message}
    </animated.div>
  );
}

export default Foo;
