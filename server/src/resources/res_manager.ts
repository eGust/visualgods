import { createServer } from 'net';

import { WebSocketContext } from '../ws_server';
import Debugger from './debug/index';

const MIN_PORT = 9527;
const MAX_PORT = 29_527;
const usedPort = new Set<number>();

const checkPortAvailable = (port: number): Promise<boolean> => new Promise<boolean>((rsv) => {
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

export const findAvailablePort = async (from: number = MIN_PORT): Promise<number> => {
  for (let port = from; port < MAX_PORT; port += 1) {
    // eslint-disable-next-line no-await-in-loop
    if (!usedPort.has(port) && await checkPortAvailable(port)) return port;
  }
  return null;
};

export const handleLaunchError = (context: WebSocketContext, error?: Error): void => {
  const { server: { id: sId }, connection: { id: cId } } = context;
  console.error(`[launch] ${sId}.${cId}`, error);
};

export class ResManager {
  public readonly api: WebSocketContext;

  public readonly port: number;

  public get selectedCategory(): string { return this.debugger.category; }

  public async select(_id: number, { category = null }): Promise<Record<string, unknown>> {
    if (category === this.selectedCategory) {
      return { message: 'same' };
    }

    const { breakpoints, scripts } = await this.debugger.selectCategory(category);
    return { message: 'selected', breakpoints, scripts };
  }

  public async inspect(id: number, { action, ...params }: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (!this.selectedCategory) throw Error('No category selected');
    if (!action) throw Error('No action');

    this.debugger.inspect(id, `${this.selectedCategory}.${action}`, params);
    return { message: 'task started' };
  }

  public closeService(): void {
    this.service.connection.disconnect();
    usedPort.delete(this.port);
    this.debugger.close();
  }

  public get service(): WebSocketContext { return this.vs; }

  public async setService(val: WebSocketContext, debugWsUrl: string): Promise<Record<string, unknown>> {
    this.vs = val;
    this.debugger = new Debugger(this.vs.connection, debugWsUrl);
    this.debugger.onStackPopulated = (breakpoint, stack) => {
      const timestamp = Date.now();
      // console.log(breakpoint, stack);
      this.api.connection.send({ method: 'task.step', params: { breakpoint, stack, timestamp } });
    };
    return this.debugger.lastTask;
  }

  public constructor(api: WebSocketContext, port: number) {
    usedPort.add(port);
    this.api = api;
    this.port = port;

    this.inspect = this.inspect.bind(this);
    this.select = this.select.bind(this);
  }

  private vs: WebSocketContext;

  private debugger: Debugger;
}
