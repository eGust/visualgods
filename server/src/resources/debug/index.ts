import WebSocket from 'ws';

import { MethodMessage } from '../../types';
import { WebSocketConnection } from '../../ws_server';

import DebugMain from './debug_main';

export default class Debugger extends DebugMain {
  public async selectCategory(category) {
    const oldResponseHandler = this.responseHandler;
    try {
      this.selectPlugin(category);
      await this.clearBreakpoints();
      await this.setupBreakpoints(category);
    } finally {
      this.responseHandler = oldResponseHandler;
    }
  }

  public inspect(id: number, method: string, params: Record<string, any>) {
    this.historyRecords = [];
    this.assignDebugHandlers();
    this.startTask({ id, method, params });
  }

  public close() {
    this.connection.close();
  }

  public get history() { return this.historyRecords; }

  public constructor(invoker: WebSocketConnection, url: string) {
    super();
    this.invoker = invoker;
    this.connection = new WebSocket(url);
    this.connection.on('open', this.init.bind(this));
    this.connection.on('message', (data) => {
      const rawMessage = data.toString();
      try {
        const mr = JSON.parse(rawMessage);
        if (mr.method) {
          this.messageHandler(mr);
        } else {
          this.responseHandler(mr);
        }
      } catch (e) {
        console.info('on:message', rawMessage);
        console.error(e);
      }
    });
  }

  private startTask({ id, method, params }: MethodMessage) {
    console.log('startTask', { id, method, params });
    this.invoker.send({ id, method, params: { ...params, task: id } });
  }

  private invoker: WebSocketConnection;

  private historyRecords: string[];
}
