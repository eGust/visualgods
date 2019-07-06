import React from 'react';

import WsContext from '../views/WsContext';
import WsManager from '../api/wsManager';
import { generateRandomNumbers, shuffleNumbers } from '../utils/sort';

interface ArrayEditorProps {
  numbers: number[];
  updateItems: (items: number[]) => void;
}

interface ArrayEditorState {
  source: string;
  algorithm: string;
  sampleSize: number;
  manualText: string;
}

class ArrayEditor extends React.PureComponent<ArrayEditorProps> {
  public static contextType = WsContext;

  public constructor(props: ArrayEditorProps, context: {}) {
    super(props, context);

    this.state = {
      source: 'random',
      algorithm: '',
      sampleSize: props.numbers.length,
      manualText: props.numbers.join('\n'),
    };
    this.onSelectedSource = this.onSelectedSource.bind(this);
    this.onSelectedAlgorithm = this.onSelectedAlgorithm.bind(this);
    this.onUpdatedSampleSize = this.onUpdatedSampleSize.bind(this);
    this.onUpdatedManualText = this.onUpdatedManualText.bind(this);
    this.generateNumbers = this.generateNumbers.bind(this);
    this.shuffle = this.shuffle.bind(this);
  }

  public state: ArrayEditorState;

  public componentWillReceiveProps(nextProps: ArrayEditorProps) {
    const { source } = this.state;
    if (source === 'manual') return;
    this.setState({ manualText: nextProps.numbers.join('\n') });
  }

  private onSelectedAlgorithm(e: React.ChangeEvent<HTMLSelectElement>) {
    this.setState({ algorithm: e.target.value });
  }

  private onSelectedSource(e: React.ChangeEvent<HTMLSelectElement>) {
    this.setState({ source: e.target.value });
  }

  private onUpdatedSampleSize(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ sampleSize: +e.target.value });
  }

  private onUpdatedManualText(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const manualText = e.target.value;
    const { updateItems } = this.props;
    this.setState({ manualText });
    updateItems(manualText.split(/\D+/).filter(x => x).map(x => +x));
  }

  private generateNumbers() {
    const {
      props: { updateItems },
      state: { sampleSize },
    } = this;
    updateItems(generateRandomNumbers(sampleSize));
  }

  private shuffle() {
    const { props: { updateItems, numbers } } = this;
    const newNumbers = shuffleNumbers(numbers);
    this.setState({ manualText: newNumbers.join('\n') });
    updateItems(newNumbers);
  }

  public render() {
    const {
      state: {
        source, algorithm, sampleSize, manualText,
      },
      props: { numbers },
      context,
      onSelectedAlgorithm,
      onSelectedSource,
      onUpdatedSampleSize,
      onUpdatedManualText,
      generateNumbers,
      shuffle,
    } = this;
    const jsonValue = JSON.stringify(numbers);
    const algorithms = (context as WsManager).categories.Sort;

    return (
      <div className="array-editor">
        <div className="field">
          <label className="label">
            Sort Algorithm:
            <div className="control">
              <div className="select">
                <select value={algorithm || algorithms[0]} onChange={onSelectedAlgorithm}>
                  {
                    algorithms.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))
                  }
                </select>
              </div>
            </div>
          </label>
        </div>

        <hr />

        <div className="field">
          <label className="label">
            Data Source:
            <div className="control">
              <div className="select">
                <select value={source} onChange={onSelectedSource}>
                  <option value="random">Random</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
            </div>
          </label>
        </div>
        {
          source === 'random' ? (
            <div className="random auto-fill-column">
              <div className="field">
                <label className="label">
                  Sample Size:
                  <div className="control">
                    <input
                      type="number"
                      className="input"
                      min="3"
                      max="49"
                      value={sampleSize}
                      onChange={onUpdatedSampleSize}
                    />
                  </div>
                </label>
              </div>
              <div className="field">
                <button className="button is-primary" type="button" onClick={generateNumbers}>Generate!</button>
              </div>
              <div className="auto-fill" />
            </div>
          ) : (
            <div className="manual auto-fill-column">
              <div className="field auto-fill-column">
                <label className="label auto-fill-column">
                  Numbers:
                  <div className="control auto-fill-column">
                    <textarea
                      className="textarea auto-fill"
                      autoComplete="off"
                      rows={1}
                      value={manualText}
                      onChange={onUpdatedManualText}
                    />
                  </div>
                </label>
              </div>
            </div>
          )
        }
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
          <div className="field">
            <button className="button is-link" type="button" onClick={shuffle}>Shuffle</button>
          </div>
        </div>
      </div>
    );
  }
}

export default ArrayEditor;
