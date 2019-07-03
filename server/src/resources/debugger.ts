import WebSocket from 'ws';

import { MethodMessage, ResponseMessage } from '../types';
import {
  ScriptSource, LineMapping, Breakpoint, ParsedScript,
  DebugPaused,
  RuntimeRemoteObject,
  RtPropertyDescriptor,
} from './types';
import { WebSocketConnection } from '../ws_server';
import parseScript from './parse_script';
import { PROJECT_ROOT } from '../utils/env_vars';

import Sort from './sort';

type ResultPromise = Promise<Record<string, any>>;

interface Resolver extends Record<string, any> {
  resolve: (result: Record<string, any>) => void;
}

const INIT_MESSAGES_JSON = `
{ "method": "Debugger.enable", "params": { "maxScriptsCacheSize": 100000000 } }
{ "method": "Debugger.setPauseOnExceptions", "params": { "state": "none" } }
{ "method": "Debugger.setAsyncCallStackDepth", "params": { "maxDepth": 32 } }
{ "method": "Debugger.setBlackboxPatterns", "params": { "patterns": [] } }
{ "method": "Debugger.setBreakpointsActive", "params":{ "active": true } }
{ "method": "Runtime.enable" }
`.trim();

const INIT_MESSAGES = Object.freeze(JSON.parse(`[${INIT_MESSAGES_JSON.split('\n').join(',')}]`));

type BreakpointsFinder = (scripts: Record<string, ScriptSource>) => Record<string, LineMapping>;

const SUBJECT_BP_FINDERS: Record<string, BreakpointsFinder> = { Sort };

export default class Debugger {
  public async selectCategory(category) {
    await this.clearBreakpoints();
    await this.setupBreakpoints(category);
  }

  public inspect(id: number, method: string, params: Record<string, any>) {
    this.historyRecords = [];
    this.messageHandler = this.debuggingMessageHandler;
    this.responseHandler = this.debuggingResponseHandler;
    this.startTask({ id, method, params });
  }

  public reset() {
    this.messageHandler = this.defaultMessageHandler;
    this.responseHandler = this.defaultResponseHandler;
    this.resolveTask();
  }

  public close() {
    this.connection.close();
  }

  public get history() { return this.historyRecords; }

  public get lastTask() { return this.lastTaskPromise; }

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
    this.lastTaskPromise = new Promise<Record<string, any>>((resolve) => {
      this.taskResolver = resolve;
    });
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

  // private
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

  // TODO: extract to BreakpointsManger
  private async clearBreakpoints() {
    const { activeBreakpoints } = this;
    console.log('clearBreakpoints', activeBreakpoints);
    if (!Object.keys(activeBreakpoints).length) return;

    const oldResponseHandler = this.responseHandler;
    try {
      const resolves: Record<string, () => void> = {};

      this.responseHandler = ({ id }) => {
        resolves[id]();
      };

      await Promise.all(
        Object.keys(activeBreakpoints).map(breakpointId => new Promise<void>((resolve) => {
          const id = this.send({ method: 'Debugger.removeBreakpoint', params: { breakpointId } });
          resolves[id] = resolve;
        })),
      );
      this.activeBreakpoints = {};
    } finally {
      this.responseHandler = oldResponseHandler;
    }
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
        resolve: () => void;
      }> = {};

      const breakpoints = {};
      this.responseHandler = ({ id, result: { breakpointId } }) => {
        const { name, resolve } = resolves[id];
        breakpoints[breakpointId] = name;
        resolve();
      };

      await Promise.all(
        bps.map(({ name, ...params }) => new Promise<void>((resolve) => {
          const id = this.send({ method: 'Debugger.setBreakpointByUrl', params });
          resolves[id] = { name, resolve };
        })),
      );
      this.activeBreakpoints = breakpoints;
      console.log('breakpoints set', { breakpoints });
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

  private startTask({ id, method, params }: MethodMessage) {
    console.log('startTask', { id, method, params });
    this.invoker.send({ id, method, params: { ...params, task: id } });
  }

  private resolveTask(result: Record<string, any> = {}) {
    if (!this.taskResolver) return;
    this.taskResolver(result);
    this.taskResolver = null;
  }

  // pause/resume handlers
  private async debuggingMessageHandler({ method, params }: MethodMessage) {
    if (method === 'Debugger.paused') {
      const { hitBreakpoints: [bpId = ''] = [], callFrames } = params as DebugPaused;
      const bpName = this.activeBreakpoints[bpId];
      if (bpName) {
        // /^@(\w+):(\d+)\[(.+)\]$/.test(bpName)
        const sortIndex = callFrames.findIndex(({ functionName }) => functionName === 'sort');
        console.log({ name: bpName, id: bpId, callFrames });
        if (sortIndex > 0) {
          const objects = callFrames.slice(0, sortIndex - 1)
            .map(({ functionName, scopeChain }) => ({
              functionName,
              scopeObjects: scopeChain
                .filter(({ type }) => type === 'local' || type === 'block')
                .map(({ type, object: { objectId } }) => ({ type, objectId })),
            }));

          const stack = [];
          await Promise.all(objects.map(async ({ functionName, scopeObjects: items }) => {
            const scope = {};
            stack.push({ functionName, scope });
            const results = items.length
              ? await Promise.all(items.map(({ objectId }) => this.resolveRemoteObject(objectId)))
              : [];
            results.forEach((s) => {
              Object.assign(scope, s);
            });
          }));
          this.historyRecords.push(JSON.stringify(stack));
          console.log({ objects, stack });
        }
      }
      this.send({ method: 'Debugger.resume' });
      return;
    }
    if (method === 'Debugger.resumed') return;
    console.info('debuggingMessageHandler', { method, params }, this.msgId);
  }

  private debuggingResponseHandler({ id, result }: ResponseMessage) {
    const { debuggingResolvers } = this;
    if (debuggingResolvers.has(id)) {
      const { resolve } = debuggingResolvers.get(id);
      debuggingResolvers.delete(id);
      resolve(result);
      return;
    }
    console.info('debugger:done', { id, result });
  }

  private async resolveObjectValue(v: RuntimeRemoteObject): Promise<any> {
    if (!v.objectId) return v.value;
    const {
      objectId,
      type,
      subtype,
      preview: { properties },
    } = v;

    if (type !== 'object') {
      return properties.map(({ value }) => value);
    }

    const obj = (await this.resolveRemoteObject(objectId)) as Record<string, any>;
    if (subtype !== 'array') return obj;

    const { length, ...list } = obj;
    const items = new Array(length);
    Object.keys(list).forEach((index) => {
      items[+index] = list[index];
    });
    return items;
  }

  private async resolveRemoteObject(objectId: string): Promise<Record<string, any>> {
    const items = (await this.runtimeGetProperties(objectId)).result as RtPropertyDescriptor[];
    const entries = await Promise.all(items.map(async ({ name, value }) => (
      value && value.type !== 'function' && name !== '__proto__'
        ? [name, await this.resolveObjectValue(value)] as [string, any]
        : null
    )));

    const obj = {};
    entries.filter(x => x).forEach(([k, v]) => {
      obj[k] = v;
    });
    return obj;
  }

  private runtimeGetProperties(objectId: string): ResultPromise {
    return new Promise<Record<string, any>>((resolve) => {
      const msgId = this.send({
        method: 'Runtime.getProperties',
        params: {
          objectId,
          ownProperties: true,
          accessorPropertiesOnly: false,
          generatePreview: true,
        },
      });

      this.debuggingResolvers.set(msgId, { resolve, objectId });
    });
  }

  private debuggingResolvers = new Map<number, Resolver>();

  // default handlers
  private defaultMessageHandler(message: MethodMessage) {
    console.info('defaultMessageHandler', message, this.msgId);
  }

  private defaultResponseHandler(response: ResponseMessage) {
    console.info('defaultResponseHandler', response, this.msgId);
  }

  // init handlers
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
      this.resolveTask({ categories: Object.keys(SUBJECT_BP_FINDERS) });
      this.reset();
    }
  }

  private messageHandler: (message: MethodMessage) => void;

  private responseHandler: (response: ResponseMessage) => void;

  private invoker: WebSocketConnection;

  private connection: WebSocket;

  private scripts: Record<string, ScriptSource> = {};

  private msgId: number = 0;

  private breakpoints: Record<string, Breakpoint[]> = {};

  private activeBreakpoints: Record<string, string> = {};

  private lastTaskPromise: ResultPromise;

  private taskResolver: (result: Record<string, any>) => void;

  private historyRecords: string[];
}
