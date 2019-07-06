import React from 'react';

import Sort from './Sort';
import WsManger from '../api/wsManager';
import WsContext from './WsContext';

const views: Record<string, React.ComponentType> = { Sort };

interface LayoutState {
  current: string;
  wsManager: WsManger | null;
}

const Dummy = () => (<div />);

class Layout extends React.PureComponent {
  public state: LayoutState = {
    current: '',
    wsManager: null,
  }

  public constructor(props: {}, context: {}) {
    super(props, context);
    this.initApi();
    this.onSelected = this.onSelected.bind(this);
  }

  protected onSelected(e: React.ChangeEvent<HTMLSelectElement>) {
    this.setState({ current: e.target.value });
  }

  protected async initApi() {
    const wsManager = new WsManger();
    wsManager.onReady = () => {
      const current = Object.keys(views).find(c => c in wsManager.categories) || '';
      this.setState(() => ({ current, wsManager }));
    };
  }

  public render() {
    const { current, wsManager } = this.state;
    const Component = views[current] || Dummy;
    return wsManager ? (
      <div>
        <header>
          <select onChange={this.onSelected} value={current}>
            {
              Object.keys(views).map((name) => (
                <option key={name} value={name}>{name}</option>
              ))
            }
          </select>
        </header>
        <main>
          <WsContext.Provider value={wsManager}>
            <Component />
          </WsContext.Provider>
        </main>
      </div>
    ) : (
      <div>Connecting...</div>
    );
  }
}

export default Layout;
