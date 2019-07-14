import React from 'react';

import WsManager from '../api/wsManager';
import { NumberItem, Breakpoint } from '../types';
import { generateRandomNumbers } from '../utils/sort';

import ScopeVar from './ScopeVar';
import Insertion from './sort/Insertion';
import ArrayEditor from '../components/ArrayEditor';
import NumberBar from '../components/NumberBar';
import WsContext from './WsContext';

import '../styles/sort.sass';

interface BreakpointsResult extends Record<string, unknown> {
  breakpoints: Record<string, { id: string; line: number }>;
}

interface SortState {
  status: 'load' | 'prepare' | 'run';
  algorithm: string;
  scopeTitle: string;
  scope: Record<string, unknown>;
  items: NumberItem[];
}

class Sort extends React.PureComponent {
  public static contextType = WsContext;

  public state: SortState = {
    status: 'load',
    algorithm: '',
    scopeTitle: '',
    scope: {},
    items: generateRandomNumbers(16).map((value, index) => ({ key: `${index + 1}`, value })),
  }

  protected breakpoints: Record<string, Breakpoint> = {};

  public constructor(props: {}, context: {}) {
    super(props, context);
    this.onSelectedAlgorithm = this.onSelectedAlgorithm.bind(this);
    this.startSorting = this.startSorting.bind(this);
    this.finishSorting = this.finishSorting.bind(this);
    this.updateItems = this.updateItems.bind(this);
    this.updateScope = this.updateScope.bind(this);
    this.fetchBreakpoints();
  }

  private onSelectedAlgorithm(e: React.ChangeEvent<HTMLSelectElement>) {
    this.setState({ algorithm: e.target.value });
  }

  private startSorting() {
    // const { state: { algorithm, items } } = this;
    // const wsManager = this.context as WsManager;
    // const action = algorithm || wsManager.categories.Sort[0];
    // wsManager.send({ method: 'inspect', params: { action, items } });
    this.setState({ status: 'run' });
  }

  private finishSorting() {
    const wsManager = this.context as WsManager;
    wsManager.onMessage = console.log;
    this.setState({ status: 'prepare' });
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
        this.setState(() => ({ status: 'prepare' }));
      }
      console.log(message);
    };
  }

  private updateItems(numbers: number[]) {
    this.setState({ items: numbers.map((value, index) => ({ value, key: index.toString() })) });
  }

  private updateScope(scopeTitle: string, items: Record<string, unknown>[]) {
    this.setState({
      scopeTitle,
      scope: items.reduce((scope, item) => Object.assign(scope, item), {}),
    });
  }

  public render() {
    const { state: { status } } = this;
    switch (status) {
      case 'prepare': {
        const {
          state: { algorithm, items },
          updateItems,
          context,
          startSorting,
          onSelectedAlgorithm,
        } = this;
        const numbers = items.map(({ value }) => value);
        const algorithms = (context as WsManager).categories.Sort;
        const disabled = items.length < 3 || items.length > 44;

        return (
          <div className="sort">
            <ArrayEditor {...{ numbers, updateItems }}>
              <label className="label">Algorithm:</label>
              <div className="field has-addons">
                <div className="control is-expanded">
                  <div className="select is-fullwidth">
                    <select value={algorithm || algorithms[0]} onChange={onSelectedAlgorithm}>
                      {
                        algorithms.map((a) => (
                          <option key={a} value={a}>{a}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>
                <div className="control">
                  <button
                    className="button is-primary"
                    type="button"
                    disabled={disabled}
                    onClick={startSorting}
                  >
                    Go
                  </button>
                </div>
              </div>
            </ArrayEditor>

            <div className="preview-numbers">
              {
                disabled
                  ? (
                    <div className="error">Numbers count must between 3 and 44</div>
                  )
                  : items.map(({ value, key }) => (
                    <NumberBar key={key} value={value} />
                  ))
              }
            </div>
          </div>
        );
      }
      case 'run': {
        const {
          state: {
            algorithm, items, scopeTitle, scope,
          },
          finishSorting,
          updateScope,
        } = this;
        const numbers = items.map(({ value }) => value);
        const jsonValue = `[${numbers.join(', ')}]`;
        const wsManager = this.context as WsManager;
        const action = algorithm || wsManager.categories.Sort[0];

        return (
          <div className="sort">
            <div className="array-editor">
              <label className="label">
              Sorting
              </label>
              <div className="field has-addons">
                <div className="control is-expanded">
                  <input type="text" className="input" value={action} disabled />
                </div>
                <div className="control">
                  <button
                    className="button is-primary"
                    type="button"
                    onClick={finishSorting}
                  >
                    Return
                  </button>
                </div>
              </div>
              <hr />

              <ScopeVar title={scopeTitle} scope={scope} />

              <hr />
              <div className="preview">
                <div className="field">
                  <label className="label">
                    JSON:
                    <div className="control">
                      <pre className="pre">{jsonValue}</pre>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <Insertion
              action={action}
              items={items}
              sourceScripts={wsManager.sourceScripts}
              updateScope={updateScope}
            />
          </div>
        );
      }
      case 'load':
        return (<div>Loading...</div>);
      default:
        return (<div>Unknown Status</div>);
    }
  }
}

export default Sort;
