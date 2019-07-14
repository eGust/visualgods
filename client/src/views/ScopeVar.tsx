import React from 'react';

interface ScopeVarProps {
  title: string;
  scope: Record<string, unknown>;
}

class ScopeVar extends React.PureComponent<ScopeVarProps> {
  public render() {
    const { props: { title, scope } } = this;
    return (
      <div className="auto-fill scope-var">
        <h4>{title}</h4>
        <pre>
          {
            Object.entries(scope).map(([varName, value]) => (
              <div className="var" key={varName}>
                <span className="name">{varName}</span>
                <span className="value">{JSON.stringify(value)}</span>
              </div>
            ))
          }
        </pre>
      </div>
    );
  }
}

export default ScopeVar;
