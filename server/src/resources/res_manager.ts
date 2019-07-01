import { createServer } from 'net';

import { WebSocketContext } from '../ws_server';
import Debugger from './debugger';

const MIN_PORT = 9527;
const MAX_PORT = 29_527;
const usedPort = new Set<number>();

function checkPortAvailable(port: number) {
  return new Promise<boolean>((rsv) => {
    const srv = createServer();
    srv.on('error', () => {
      rsv(false);
    });
    srv.on('listening', () => {
      srv.close();
      rsv(true);
    });
    srv.listen(port, '127.0.0.1');
  });
}

export async function findAvailablePort(from: number = MIN_PORT) {
  for (let port = from; port < MAX_PORT; port += 1) {
    // eslint-disable-next-line no-await-in-loop
    if (!usedPort.has(port) && await checkPortAvailable(port)) return port;
  }
  return null;
}

export function handleLaunchError(context: WebSocketContext, error?: Error) {
  const { server: { id: sId }, connection: { id: cId } } = context;
  console.error(`[launch] ${sId}.${cId}`, error);
}

export class ResManager {
  public readonly api: WebSocketContext;

  public readonly port: number;

  public get debugger() { return this.debug; }

  public closeService() {
    this.service.connection.disconnect();
    usedPort.delete(this.port);
    this.debug.close();
  }

  public get service() { return this.vs; }

  public set service(val: WebSocketContext) {
    this.vs = val;
    this.debug = new Debugger(this.vs.connection, this.debugWsUrl);
  }

  public constructor(api: WebSocketContext, port: number, debugWsUrl: string) {
    usedPort.add(port);
    this.api = api;
    this.port = port;
    this.debugWsUrl = debugWsUrl;
  }

  private vs: WebSocketContext;

  private debugWsUrl: string;

  private debug: Debugger;
}
