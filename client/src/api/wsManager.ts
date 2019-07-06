import { IS_DEV } from '../env';

const messageLog = (message: Record<string, unknown>): void => console.log(message);

interface Message {
  method: string;
  id?: number;
  params?: Record<string, unknown>;
}

interface SourceScript {
  file: string;
  source: string;
  lines: string[];
}

interface InitRecord extends Record<string, unknown> {
  categories?: { categories: Record<string, string[]> };
  ready?: { categories: string[]; scripts: Record<string, SourceScript> };
}

class WsManager {
  public get isClosed(): boolean { return this.closed; }

  public get messageId(): number { return this.msgId; }

  public readonly categories: Record<string, string[]> = {};

  public readonly sourceScripts: Record<string, SourceScript> = {};

  public onMessage: (message: Record<string, unknown>) => void;

  public onClosed: () => void = () => {};

  public onReady: (ws: WsManager) => void = () => {};

  public send(message: Message): number {
    const id = this.msgId + 1;
    this.msgId = id;
    this.connection.send(JSON.stringify({ ...message, id }));
    return id;
  }

  public constructor() {
    this.onMessage = this.initMessageHandler.bind(this);
    this.connection = new WebSocket(IS_DEV ? 'ws://127.0.0.1:3333/api' : '/api');

    this.connection.addEventListener('message', (message) => {
      const data = message.data as string;
      if (!data) return;

      try {
        const msg = JSON.parse(data);
        this.onMessage(msg);
      } catch (e) {
        console.error(e, message);
      }
    });

    this.connection.addEventListener('close', () => {
      this.closed = true;
      this.onClosed();
    });
  }

  private initMessageHandler(message: Record<string, unknown>): void {
    const { method, params } = message as { method: string; params: Record<string, unknown>};
    const { init: store } = this;
    store[method] = params;
    if (!('categories' in store && 'ready' in store)) return;

    const { ready: { categories: available = [], scripts = {} } = {}, categories: { categories = {} } = {} } = store;
    const { categories: result } = this;
    available.filter(c => c in categories).forEach((c) => {
      result[c] = categories[c];
    });

    Object.entries(scripts).forEach(([id, script]) => {
      this.sourceScripts[id] = {
        ...script,
        lines: script.source.split('\n'),
      };
    });
    this.onMessage = messageLog;
    this.onReady(this);
  }

  private init: InitRecord = {};

  private closed = false;

  private msgId = 0;

  private connection: WebSocket;
}

export default WsManager;
