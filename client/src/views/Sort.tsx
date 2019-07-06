import React from 'react';

import WsContext from './WsContext';
import WsManager from '../api/wsManager';

interface Breakpoint {
  scriptId: string;
  line: number;
}

interface BreakpointsResult extends Record<string, unknown> {
  breakpoints: Record<string, { id: string; line: number }>;
}

class Sort extends React.PureComponent {
  public static contextType = WsContext;

  public state = { ready: false }

  protected breakpoints: Record<string, Breakpoint> = {};

  public constructor(props: {}, context: {}) {
    super(props, context);
    this.fetchBreakpoints();
  }

  protected fetchBreakpoints() {
    const wsManager = this.context as WsManager;
    wsManager.send({ method: 'select', params: { category: 'Sort' } });
    wsManager.onMessage = (message) => {
      if (message.result && 'breakpoints' in (message.result as Record<string, unknown>)) {
        const { breakpoints } = (message.result as BreakpointsResult);
        Object.entries(breakpoints).forEach(([name, { id: scriptId, line }]) => {
          this.breakpoints[name] = { scriptId, line };
        });
        this.setState(() => ({ ready: true }));
      }
      console.log(message);
    };
    console.log(wsManager);
  }

  public render() {
    const { ready } = this.state;
    return ready ? (
      <div>Ready</div>
    ) : (
      <div>Loading...</div>
    );
  }
}

export default Sort;
