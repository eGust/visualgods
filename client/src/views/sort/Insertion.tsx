import React from 'react';

import WsManager from '../../api/wsManager';
import { NumberItem, SourceScript } from '../../types';

import NumberBar from '../../components/NumberBar';
import SourceCode from '../SourceCode';
import WsContext from '../WsContext';
import { ItemStatus } from '../../components/common_types';

interface StackItem {
  functionName: string;
  location: { scriptId: string; lineNumber: number; columnNumber: number };
  scope: Record<string, unknown>;
}

interface Step extends Record<string, unknown> {
  breakpoint: string;
  stack: StackItem[];
}

enum ActionType {
  Compare = 'Compare',
  Swap = 'Swap',
  Done = 'Done',
}

interface Action {
  type: ActionType;
  stack: StackItem[];
}

interface SortingState {
  index: number;
  done: boolean;
  scriptId: string;
  actions: Action[];
}

interface SortingProps {
  action: string;
  items: NumberItem[];
  sourceScripts: Record<string, SourceScript>;
  updateScope: (title: string, scopes: Record<string, unknown>[]) => void;
}

const numberItemsToNumbers = (items: NumberItem[]) => items.map(({ value }) => value);

const decodeNumberItem = ({ elements, ...scope }: Record<string, unknown>) => {
  let s = scope;
  if ('a' in s && 'b' in s) {
    const a = s.a as NumberItem;
    const b = s.b as NumberItem;
    s = { ...s, a: a.value, b: b.value };
  }

  if ('pivot' in s) {
    s = { ...s, pivot: (s.pivot as NumberItem).value };
  }

  return s;
};

const extractSortingCode = (src?: SourceScript) => {
  if (!src) return undefined;

  const { lines } = src;
  const lineConst = lines.findIndex(ln => /^const\b/.test(ln));
  let lineStop = lines.findIndex(ln => /^class\b/.test(ln));
  for (; !lines[lineStop - 1].trim(); lineStop -= 1) ;

  return {
    lines: lines.slice(lineConst, lineStop),
    base: lineConst + 1,
  };
};

class Insertion extends React.PureComponent<SortingProps> {
  public static contextType = WsContext;

  public state: SortingState = {
    index: 0,
    done: false,
    scriptId: '',
    actions: [],
  }

  public constructor(props: SortingProps) {
    super(props);
    this.goPrev = this.goPrev.bind(this);
    this.goNext = this.goNext.bind(this);
    this.updateActionIndex = this.updateActionIndex.bind(this);
  }

  public componentDidMount() {
    const wsManager = this.context as WsManager;
    this.setState({ actions: [] });

    wsManager.onMessage = (message) => {
      const { method = '' } = message;
      switch (method) {
        case 'task.step': {
          const { breakpoint, stack } = message.params as Step;
          const { state: { actions, scriptId } } = this;
          const { functionName, location, scope: { items, ...scope } } = stack[1];

          const newState = {
            actions: [...actions, {
              type: breakpoint === 'comparer' ? ActionType.Compare : ActionType.Swap,
              stack: [stack[0], { functionName, location, scope }],
            }],
          };

          this.setState(scriptId ? newState : {
            ...newState,
            scriptId: location.scriptId,
          });

          if (!scriptId) { this.updateScope(); }
          break;
        }
        case 'task.finished': {
          const { state: { actions } } = this;
          const elements = (message.params as Record<string, unknown>).sorted as NumberItem[];
          this.setState({
            done: true,
            actions: [...actions, {
              type: ActionType.Done,
              stack: [{ functionName: '', location: {}, scope: { elements } }],
            }],
          });
          this.updateScope();
          break;
        }
        default: {
          console.log(message);
          this.updateScope();
        }
      }
    };

    const { props: { action, items } } = this;
    wsManager.send({ method: 'inspect', params: { action, items } });
  }

  private updateScope() {
    setTimeout(() => {
      const { state: { actions, index }, props: { updateScope, items } } = this;
      const maxStep = actions.length - 1;

      const currentAction = index >= 0 && index <= maxStep ? actions[index] : null;
      const nextAction = actions.slice(index).find(({ type }) => type !== ActionType.Compare);
      const curItems = nextAction ? nextAction.stack[0].scope.elements as NumberItem[] : items;
      const frames = (currentAction ? currentAction.stack : [])
        .map(({ scope }) => decodeNumberItem(scope));

      updateScope(currentAction ? currentAction.type : '', [{ items: numberItemsToNumbers(curItems) }, ...frames]);
    }, 1);
  }

  private goPrev() {
    const { state: { index: curIndex } } = this;
    const index = curIndex > 0 ? curIndex - 1 : 0;
    this.setState({ index });
    this.updateScope();
  }

  private goNext() {
    const { state: { actions, index: curIndex } } = this;
    const index = curIndex < actions.length - 1 ? curIndex + 1 : actions.length - 1;
    this.setState({ index });
    this.updateScope();
  }

  private updateActionIndex(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ index: e.target.value });
    this.updateScope();
  }

  public render() {
    const {
      state: {
        done, actions, index, scriptId,
      },
      props: { sourceScripts },
      goPrev,
      goNext,
      updateActionIndex,
    } = this;
    const maxStep = actions.length - 1;
    const sourceScript = scriptId ? sourceScripts[scriptId] : null;

    const currentAction = index >= 0 && index <= maxStep ? actions[index] : null;
    const nextAction = actions.slice(index).find(({ type }) => type !== ActionType.Compare);
    const currentItems = nextAction && nextAction.stack[0].scope.elements as NumberItem[];
    let numberBars: JSX.Element[] | null = null;

    if (currentAction && currentItems) {
      switch (currentAction.type) {
        case ActionType.Compare: {
          const [
            { r },
            { i, j },
          ] = currentAction.stack.map(({ scope }) => scope) as [
            { r: number },
            { i: number; j: number },
          ];
          const ss = {
            [i]: ItemStatus.Updating,
            [j]: ItemStatus.Deleting,
            [j - 1]: r > 0 ? ItemStatus.Selected : ItemStatus.Creating,
          };

          numberBars = currentItems.map(({ value, key }, idx) => (
            <NumberBar key={key} value={value} status={ss[idx] || ItemStatus.Normal} />
          ));
          break;
        }
        case ActionType.Swap: {
          const { i, j } = currentAction.stack[1].scope as { i: number; j: number };
          const ss = {
            [i]: ItemStatus.Updating,
            [j]: ItemStatus.Selected,
            [j - 1]: ItemStatus.Selected,
          };

          numberBars = currentItems.map(({ value, key }, idx) => (
            <NumberBar key={key} value={value} status={ss[idx] || ItemStatus.Normal} />
          ));
          break;
        }
        default:
          numberBars = currentItems.map(({ value, key }) => (
            <NumberBar key={key} value={value} />
          ));
      }
    }

    return (
      <div className="sorting">
        <div className="stat">
          <button className="button" type="button" disabled={index <= 0} onClick={goPrev}>◀</button>
          <label>Total:</label>
          <div className="steps">{ done ? actions.length : '...' }</div>
          <label>Current:</label>
          <div className="index">{index}</div>
          <button className="button" type="button" disabled={index >= maxStep} onClick={goNext}>▶</button>
        </div>

        <div className="chart">
          {numberBars}
        </div>

        <input
          type="range"
          className="slider is-fullwidth"
          step="1"
          min="0"
          max={maxStep}
          value={index}
          onChange={updateActionIndex}
        />

        <SourceCode source={extractSortingCode(sourceScript || undefined)} />
      </div>
    );
  }
}

export default Insertion;
