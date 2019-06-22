import { argv } from 'process';
import WebSocket from 'ws';

const [port, token] = argv.slice(2);
const wsUrl = `ws://127.0.0.1:${port}/visualgods/${token}`;
console.log(wsUrl);

interface ResponseMessage {
  id: number;
  data: Record<string, any>;
}

interface MethodMessage extends ResponseMessage {
  method: string;
}

function main() {
  const ws = new WebSocket(wsUrl);
  ws.on('ping', ws.pong.bind(ws));
  ws.on('message', (data) => {
    console.log(data);
  });
}

setTimeout(main, 1);
