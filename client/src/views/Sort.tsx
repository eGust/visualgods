import React from 'react';

import WsContext from './WsContext';
import WsManager from '../api/wsManager';
import { NumberItem, Breakpoint } from '../types';
import { generateRandomNumbers } from '../utils/sort';

import ArrayEditor from '../components/ArrayEditor';
import '../styles/sort.sass';

interface BreakpointsResult extends Record<string, unknown> {
  breakpoints: Record<string, { id: string; line: number }>;
}

interface SortState {
  ready: boolean;
  items: NumberItem[];
}

class Sort extends React.PureComponent {
  public static contextType = WsContext;

  public state: SortState = {
    ready: false,
    items: generateRandomNumbers(24).map((value, index) => ({ key: (index + 1).toString(), value })),
  }

  protected breakpoints: Record<string, Breakpoint> = {};

  public constructor(props: {}, context: {}) {
    super(props, context);
    this.updateItems = this.updateItems.bind(this);
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

  private updateItems(numbers: number[]) {
    this.setState({ items: numbers.map((value, index) => ({ value, key: index.toString() })) });
  }

  public render() {
    const { state: { ready, items }, updateItems } = this;
    const numbers = items.map(({ value }) => value);
    return ready ? (
      <div className="sort">
        <ArrayEditor {...{ numbers, updateItems }} />
      </div>
    ) : (
      <div>Loading...</div>
    );
  }
}

export default Sort;
