import { argv } from 'process';
import WebSocket from 'ws';

import { MethodMessage, ResponseMessage } from './types';
import methodHandlers from './methods/index';

const [port, token] = argv.slice(2);
const wsUrl = `ws://127.0.0.1:${port}/visualgods/${token}`;
console.log(wsUrl);

function main() {
  const ws = new WebSocket(wsUrl);
  const respond = (response: ResponseMessage) => {
    ws.send(JSON.stringify(response));
  };

  ws.on('ping', ws.pong.bind(ws));
  ws.on('message', async (data) => {
    console.log(data);
    try {
      const message = JSON.parse(data.toString()) as MethodMessage;
      console.log('message', message);
      const [subject, method] = message.method.split('.');
      const handler = methodHandlers[subject];
      if (handler) {
        const m = handler[method];
        if (m) {
          const result = await m(message.params);
          respond({ id: message.id, result });
        }
      }
    } catch (e) {
      console.log('error', e);
    }
  });
}

setTimeout(main, 1);
