import WebSocket from 'ws';

import { ResponseMessage, MethodMessage } from './types';
import { WebSocketConnection } from './ws_server';

export type History = Record<string, any>[];

interface Task {
  history: History;
  resolve: (value: Record<string, any>[]) => void;
}

export default class Debugger {
  public inspect(id: number, method: string, params: Record<string, any>): Promise<History> {
    return new Promise((resolve) => {
      const task = {
        history: [],
        resolve,
      };
      this.tasks.set(id, task);
      this.startTask({ id, method, params });
    });
  }

  public close() {
    this.connection.close();
  }

  public constructor(invoker: WebSocketConnection, url: string) {
    this.invoker = invoker;
    this.connection = new WebSocket(url);
    this.connection.on('message', this.onMessage.bind(this));
    this.connection.on('open', this.initDebugger.bind(this));
  }

  private initDebugger() {
    [
      { id: 1, method: 'Debugger.enable', params: { maxScriptsCacheSize: 100_000_000 } },
      { id: 2, method: 'Debugger.setPauseOnExceptions', params: { state: 'none' } },
      { id: 3, method: 'Debugger.setAsyncCallStackDepth', params: { maxDepth: 32 } },
      { id: 4, method: 'Debugger.setBlackboxPatterns', params: { patterns: [] } },
      // { id: 6, method: 'Runtime.getIsolateId' },
      // { id: 8, method: 'Runtime.runIfWaitingForDebugger' },
    ].forEach((msg) => {
      console.log('--');
      console.log('send', JSON.stringify(msg));
      console.log('==');
      this.send(msg);
    });
  }

  private send(message: MethodMessage) {
    this.connection.send(JSON.stringify(message));
  }

  private startTask({ id, method, params }: MethodMessage) {
    console.log('startTask', { id, method, params });
    this.invoker.send({ id, method, params: { ...params, task: id } });
  }

  private onMessage(data: string) {
    try {
      const response = JSON.parse(data) as ResponseMessage;
      console.info('onMessage', data);
      console.info(response);
      console.log('\n');
      if (response.id) {
        const { result: { task: taskId, ...result } } = response;
        if (taskId) {
          const task = this.tasks.get(taskId);
          task.history.push(result);
        // } else {
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  private tasks = new Map<number, Task>();

  private invoker: WebSocketConnection;

  private connection: WebSocket;
}
