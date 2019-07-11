import React from 'react';

import WsManager from '../../api/wsManager';
import { NumberItem } from '../../types';

import NumberBar from '../../components/NumberBar';
import WsContext from '../WsContext';

interface StackItem {
  functionName: string;
  location: { scriptId: string; lineNumber: number; columnNumber: number };
  scope: Record<string, unknown>;
}

interface Step extends Record<string, unknown> {
  breakpoint: string;
  stack: StackItem[];
}

interface SortingState {
  index: number;
  done: boolean;
  steps: { comparisons: Record<string, unknown>[]; swap: Record<string, unknown> }[];
}

interface SortingProps {
  action: string;
  items: NumberItem[];
}

class Insertion extends React.PureComponent<SortingProps> {
  public static contextType = WsContext;

  public state: SortingState = {
    index: 0,
    done: false,
    steps: [],
  }

  private comparisons: Record<string, unknown>[] = [];

  public constructor(props: SortingProps) {
    super(props);
    this.goPrev = this.goPrev.bind(this);
    this.goNext = this.goNext.bind(this);
  }

  public componentDidMount() {
    const wsManager = this.context as WsManager;
    this.setState({ steps: [] });

    wsManager.onMessage = (message) => {
      const { method = '' } = message;
      switch (method) {
        case 'task.step': {
          const { breakpoint, stack } = message.params as Step;
          if (breakpoint === 'comparer') {
            this.comparisons.push(stack[0].scope);
          } else if (breakpoint === 'swap') {
            const { comparisons: comparer, state: { steps } } = this;
            this.setState({ steps: [...steps, { comparer, swap: stack[0].scope }] });
            this.comparisons = [];
          }
          break;
        }
        case 'task.finished': {
          const { state: { steps } } = this;
          const sorted = (message.params as Record<string, unknown>).sorted as NumberItem[];
          this.setState({ done: true, steps: [...steps, { comparer: {}, swap: { list: sorted } }] });
          break;
        }
        default:
          console.log(message);
      }
    };

    const { props: { action, items } } = this;
    wsManager.send({ method: 'inspect', params: { action, items } });
  }

  private goPrev() {
    const { state: { index: curIndex } } = this;
    const index = curIndex > 0 ? curIndex - 1 : 0;
    this.setState({ index });
  }

  private goNext() {
    const { state: { steps, index: curIndex } } = this;
    const index = curIndex < steps.length - 1 ? curIndex + 1 : steps.length - 1;
    this.setState({ index });
  }

  public render() {
    const { state: { done, steps, index }, goPrev, goNext } = this;
    const maxStep = steps.length - 1;
    const currentItems = (index >= 0 && index <= maxStep && steps[index].swap.list) || [];
    return (
      <div className="sorting">
        <div className="stat">
          <button className="button" type="button" disabled={index <= 0} onClick={goPrev}>◀</button>
          <label>Total:</label>
          <div className="steps">{ done ? steps.length : '...' }</div>
          <label>Current:</label>
          <div className="index">{index}</div>
          <button className="button" type="button" disabled={index >= maxStep} onClick={goNext}>▶</button>
        </div>
        <div className="chart">
          {
            (currentItems as NumberItem[]).map(({ value, key }) => (
              <NumberBar key={key} value={value} />
            ))
          }
        </div>
      </div>
    );
  }
}

export default Insertion;
