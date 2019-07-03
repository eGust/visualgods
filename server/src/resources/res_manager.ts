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

  public get selected() { return this.category; }

  public async select(_id: number, { category = null }) {
    if (this.category === category) {
      return { message: 'same' };
    }

    await this.debugger.selectCategory(category);
    this.category = category;
    return { message: 'selected' };
  }

  public getHistory(): string[] { return this.debugger ? [...this.debugger.history] : []; }

  public async inspect(id: number, { action = '', ...params }: Record<string, any>) {
    if (!this.selected) throw Error('No category selected');
    if (!action) throw Error('No action');

    this.debugger.inspect(id, `${this.selected}.${action}`, params);
    return { message: 'task started' };
  }

  public closeService() {
    this.service.connection.disconnect();
    usedPort.delete(this.port);
    this.debugger.close();
  }

  public get service() { return this.vs; }

  public async setService(val: WebSocketContext) {
    this.vs = val;
    this.debugger = new Debugger(this.vs.connection, this.debugWsUrl);
    return this.debugger.lastTask;
  }

  public constructor(api: WebSocketContext, port: number, debugWsUrl: string) {
    usedPort.add(port);
    this.api = api;
    this.port = port;
    this.debugWsUrl = debugWsUrl;

    this.inspect = this.inspect.bind(this);
    this.select = this.select.bind(this);
  }

  private vs: WebSocketContext;

  private debugWsUrl: string;

  private debugger: Debugger;

  private category: string = null;
}
