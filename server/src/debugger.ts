import WebSocket from 'ws';

import { WebSocketConnection, MethodMessage, ResponseMessage } from './ws_server';

export type History = Record<string, any>[];

interface Task {
  history: History;
  resolve: (value?: Record<string, any>[] | PromiseLike<Record<string, any>[]>) => void;
}

export default class Debugger {
  public inspect(id: number, method: string, data: Record<string, any>): Promise<History> {
    return new Promise((resolve) => {
      const task = {
        history: [],
        resolve,
      };
      this.tasks.set(id, task);
      this.startTask({ id, method, data });
    });
  }

  public constructor(invoker: WebSocketConnection, url: string) {
    this.invoker = invoker;
    this.connection = new WebSocket(url);
    this.connection.on('message', this.onMessage.bind(this));
  }

  private startTask({ id, method, data }: MethodMessage) {
    this.invoker.send({ id, method, data: { ...data, task: id } });
  }

  private onMessage(data: string) {
    const { result: { task: taskId, ...result } } = JSON.parse(data) as ResponseMessage;
    const task = this.tasks.get(taskId);
    task.history.push(result);
  }

  private tasks = new Map<number, Task>();

  private invoker: WebSocketConnection;

  private connection: WebSocket;
}
