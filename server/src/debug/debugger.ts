import WebSocket from 'ws';

import { ResponseMessage, MethodMessage, ScriptSource } from '../types';
import { WebSocketConnection } from '../ws_server';
import parseScript from '../utils/script';
import { PROJECT_ROOT } from '../utils/env_vars';

export type History = Record<string, any>[];

interface Task {
  history: History;
  resolve: (value: Record<string, any>[]) => void;
}

const INIT_MESSAGES_JSON = `
{ "method": "Debugger.enable", "params": { "maxScriptsCacheSize": 100000000 } }
{ "method": "Debugger.setPauseOnExceptions", "params": { "state": "none" } }
{ "method": "Debugger.setAsyncCallStackDepth", "params": { "maxDepth": 32 } }
{ "method": "Debugger.setBlackboxPatterns", "params": { "patterns": [] } }
{ "method": "Debugger.setBreakpointsActive", "params":{ "active": true } }
`.trim();

const INIT_MESSAGES = Object.freeze(JSON.parse(`[${INIT_MESSAGES_JSON.split('\n').join(',')}]`));

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
    this.connection.on('message', this.onInitMessage.bind(this));
    this.connection.on('open', () => {
      this.onInitMessage('{"id":"0"}');
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
      const response = JSON.parse(data);
      if (response.id) {
        const { result: { task: taskId, ...result } } = response as ResponseMessage;
        if (taskId) {
          const task = this.tasks.get(taskId);
          task.history.push(result);
        // } else {
        }
      } else if (response.method === 'Debugger.scriptParsed') {
        const script = parseScript(response.params);
        if (script) {
          this.scripts[script.file.slice(PROJECT_ROOT.length + 1)] = script;
        }
        return;
      }

      console.info('onMessage', response);
      if (response.id === 4) {
        console.log(this.scripts);
      }
      console.log('\n');
    } catch (e) {
      console.info(data);
      console.error('onMessage', data, e);
    }
  }

  private onInitMessage(data: string) {
    const response = JSON.parse(data);
    if (response.id) {
      const id = +response.id;
      const initMsg = INIT_MESSAGES[id];
      if (initMsg) {
        this.send({ id: id + 1, ...initMsg });
      } else {
        // console.log(this.scripts);
        this.msgId = id;
        this.connection.on('message', this.onMessage.bind(this));
      }
    } else if (response.method === 'Debugger.scriptParsed') {
      const script = parseScript(response.params);
      if (script) {
        this.scripts[script.file.slice(PROJECT_ROOT.length + 1)] = script;
      }
    }
  }

  private tasks = new Map<number, Task>();

  private invoker: WebSocketConnection;

  private connection: WebSocket;

  private scripts: Record<string, ScriptSource> = {};

  private msgId: number = 0;
}
