import WebSocket from 'ws';

import {
  MethodMessage, ResponseMessage,
  ScriptSource, LineMapping, Breakpoint, ParsedScript,
} from '../types';
import { WebSocketConnection } from '../ws_server';
import parseScript from '../utils/script';
import { PROJECT_ROOT } from '../utils/env_vars';

import Sort from './sort';

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

type BreakpointsFinder = (scripts: Record<string, ScriptSource>) => Record<string, LineMapping>;

const SUBJECT_BP_FINDERS: Record<string, BreakpointsFinder> = { Sort };

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

    // bind
    this.send = this.send.bind(this);
    this.defaultMessageHandler = this.defaultMessageHandler.bind(this);
    this.defaultResponseHandler = this.defaultResponseHandler.bind(this);

    // init
    this.messageHandler = this.initMessageHandler.bind(this);
    this.responseHandler = this.initResponseHandler.bind(this);
    this.connection.on('open', () => {
      this.initResponseHandler({ id: 0 });
    });

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

  private send(message: MethodMessage): number {
    if (message.id) {
      this.connection.send(JSON.stringify(message));
      return message.id;
    }

    const id = this.msgId;
    this.msgId += 1;
    this.connection.send(JSON.stringify({ ...message, id }));
    return id;
  }

  private async clearBreakpoints() {
    console.log(this.breakpoints);
  }

  private async setupBreakpoints(subject: string) {
    let bps = this.breakpoints[subject];
    if (!bps) {
      const findBps = SUBJECT_BP_FINDERS[subject];
      if (findBps) {
        const bpLineMappings = findBps(this.scripts);
        console.log('setupBreakpoints', bpLineMappings);
        if (!bpLineMappings) return;

        bps = await this.convertBreakpoints(bpLineMappings);
        this.breakpoints[subject] = bps;
        console.log(bps);
      }
    }

    if (!bps) return;
    const oldResponseHandler = this.responseHandler;

    try {
      const resolves: Record<string, {
        name: string;
        resolve: (value: { name: string; breakpointId: string }) => void;
      }> = {};

      this.responseHandler = ({ id, result: { breakpointId, ...result } }) => {
        const { name, resolve } = resolves[id];
        resolve({ ...result, name, breakpointId });
      };

      const breakpoints = await Promise.all(
        bps.map(({ name, ...params }) => new Promise((resolve) => {
          const id = this.send({ method: 'Debugger.setBreakpointByUrl', params });
          resolves[id] = { name, resolve };
        })),
      );
      console.log({ breakpoints });
    } finally {
      this.responseHandler = oldResponseHandler;
    }
  }

  private async convertBreakpoints(src: Record<string, LineMapping>): Promise<Breakpoint[]> {
    const oldResponseHandler = this.responseHandler;
    try {
      const resolves: Record<string, {
        name: string;
        url: string;
        resolve: (value: Breakpoint) => void;
      }> = {};

      this.responseHandler = ({ id, result: { locations: [location] } }) => {
        const { name, url, resolve } = resolves[id];
        const { lineNumber, columnNumber } = location;
        const bp = {
          name,
          url,
          lineNumber,
          columnNumber,
        };
        console.log('getPossibleBreakpoints', location.scriptId, bp);
        resolve(bp);
      };

      const results = await Promise.all<Breakpoint>(Object.entries(src)
        .map(([name, bp]) => new Promise((resolve) => {
          const { line: lineNumber, scriptId, mappings } = bp;
          const params = {
            start: { lineNumber, scriptId, columnNumber: null },
            end: { lineNumber, scriptId, columnNumber: null },
          };
          ([{ col: params.start.columnNumber }, { col: params.end.columnNumber }] = mappings);

          const id = this.send({ method: 'Debugger.getPossibleBreakpoints', params });
          resolves[id] = { name, url: bp.url, resolve };
        })));
      return results;
    } finally {
      this.responseHandler = oldResponseHandler;
    }
  }

  private async startTask({ id, method, params }: MethodMessage) {
    console.log('startTask', { id, method, params });
    await this.clearBreakpoints();
    await this.setupBreakpoints(method.split('.')[0]);
    this.invoker.send({ id, method, params: { ...params, task: id } });
  }

  private defaultMessageHandler(message: MethodMessage) {
    console.info('defaultMessageHandler', message, this.msgId);
  }

  private defaultResponseHandler(response: ResponseMessage) {
    console.info('defaultResponseHandler', response, this.msgId);
  }

  private initMessageHandler(message: MethodMessage) {
    if (message.method !== 'Debugger.scriptParsed') return;

    const script = parseScript(message.params as ParsedScript);
    if (script) {
      this.scripts[script.file.slice(PROJECT_ROOT.length + 1)] = script;
    }
  }

  private initResponseHandler(response: ResponseMessage) {
    const { id } = response;
    const initMsg = INIT_MESSAGES[id];
    if (initMsg) {
      this.send({ id: id + 1, ...initMsg });
    } else {
      console.log('init:done', id, this.scripts);
      this.msgId = id;
      this.messageHandler = this.defaultMessageHandler;
      this.responseHandler = this.defaultResponseHandler;
    }
  }

  private messageHandler: (message: MethodMessage) => void;

  private responseHandler: (response: ResponseMessage) => void;

  private tasks = new Map<number, Task>();

  private invoker: WebSocketConnection;

  private connection: WebSocket;

  private scripts: Record<string, ScriptSource> = {};

  private msgId: number = 0;

  private breakpoints: Record<string, Breakpoint[]> = {};
}
