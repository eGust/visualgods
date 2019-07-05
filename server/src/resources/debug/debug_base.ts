import WebSocket from 'ws';
import { MethodMessage, ResponseMessage } from '../../types';

const defaultMessageHandler = (message: MethodMessage) => {
  console.info('defaultMessageHandler', message);
};

const defaultResponseHandler = (response: ResponseMessage) => {
  console.info('defaultResponseHandler', response);
};

export default class DebuggerBase {
  public reset() {
    this.messageHandler = defaultMessageHandler;
    this.responseHandler = defaultResponseHandler;
    this.resolveTask();
  }

  public get lastTask() { return this.lastTaskPromise; }

  protected constructor() {
    this.send = this.send.bind(this);
    this.lastTaskPromise = new Promise<Record<string, any>>((resolve) => {
      this.taskResolver = resolve;
    });
  }

  protected send(message: MethodMessage): number {
    if (message.id) {
      this.connection.send(JSON.stringify(message));
      return message.id;
    }

    const id = this.msgId + 1;
    this.msgId = id;
    this.connection.send(JSON.stringify({ ...message, id }));
    return id;
  }

  protected messageHandler: (message: MethodMessage) => void;

  protected responseHandler: (response: ResponseMessage) => void;

  protected connection: WebSocket;

  protected resolveTask(result: Record<string, any> = {}) {
    if (!this.taskResolver) return;
    this.taskResolver(result);
    this.taskResolver = null;
  }

  private taskResolver: (result: Record<string, any>) => void;

  private lastTaskPromise: Promise<Record<string, any>>;

  private msgId: number = 0;
}
