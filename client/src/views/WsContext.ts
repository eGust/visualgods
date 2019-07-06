import React from 'react';

import WsManger from '../api/wsManager';

const WsContext = React.createContext<WsManger | null>(null);
export default WsContext;
