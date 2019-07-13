import React from 'react';

interface SourceCodeProps {
  source?: {
    lines: string[];
    base: number;
  };
}

class SourceCode extends React.PureComponent<SourceCodeProps> {
  public render() {
    const { props: { source } } = this;
    return (
      <div className="source-code">
        <pre>
          {
            source
              ? source.lines.map((line, index) => (
                <div className="line" key={index.toString()}>
                  <span className="no">{(source.base + index).toString().padStart(3, ' ')}</span>
                  <span className="code">{line}</span>
                </div>
              ))
              : ''
          }
        </pre>
      </div>
    );
  }
}

export default SourceCode;
