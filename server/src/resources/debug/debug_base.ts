import WebSocket from 'ws';
import { MethodMessage, ResponseMessage } from '../../types';

const defaultMessageHandler = (message: MethodMessage): void => {
  console.info('defaultMessageHandler', message);
};

const defaultResponseHandler = (response: ResponseMessage): void => {
  console.info('defaultResponseHandler', response);
};

export default class DebuggerBase {
  public reset(): void {
    this.messageHandler = defaultMessageHandler;
    this.responseHandler = defaultResponseHandler;
    this.resolveTask();
  }

  public get lastTask(): Promise<Record<string, unknown>> { return this.lastTaskPromise; }

  protected constructor() {
    this.send = this.send.bind(this);
    this.lastTaskPromise = new Promise<Record<string, unknown>>((resolve) => {
      this.taskResolver = resolve;
    });
  }

  protected send(message: Record<string, unknown>): number {
    if (message.id) {
      this.connection.send(JSON.stringify(message));
      return message.id as number;
    }

    const id = this.msgId + 1;
    this.msgId = id;
    this.connection.send(JSON.stringify({ ...message, id }));
    return id;
  }

  protected messageHandler: (message: MethodMessage) => void;

  protected responseHandler: (response: ResponseMessage) => void;

  protected connection: WebSocket;

  protected resolveTask(result: Record<string, unknown> = {}): void {
    if (!this.taskResolver) return;
    this.taskResolver(result);
    this.taskResolver = null;
  }

  private taskResolver: (result: Record<string, unknown>) => void;

  private lastTaskPromise: Promise<Record<string, unknown>>;

  private msgId: number = 0;
}
