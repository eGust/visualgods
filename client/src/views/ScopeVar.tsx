import React from 'react';

interface ScopeVarProps {
  scope: Record<string, unknown>;
}

class ScopeVar extends React.PureComponent<ScopeVarProps> {
  public render() {
    const { props: { scope } } = this;
    return (
      <pre className="auto-fill scope-var">
        {
          Object.entries(scope).map(([varName, value]) => (
            <div className="var" key={varName}>
              <span className="name">{varName}</span>
              <span className="value">{JSON.stringify(value)}</span>
            </div>
          ))
        }
      </pre>
    );
  }
}

export default ScopeVar;
