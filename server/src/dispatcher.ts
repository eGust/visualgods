import { spawn } from 'child_process';
import { promisified as phin } from 'phin';

import createWsServer, { WebSocketServer, WebSocketContext } from './ws_server';
import { MethodMessage, AnyMessage } from './types';
import { SERVICE_ROOT } from './utils/env_vars';
import { ResManager, findAvailablePort, handleLaunchError } from './resources/res_manager';

const LAUNCH_OPTIONS = { cwd: SERVICE_ROOT };

type ResMethod = (id: number, params: Record<string, unknown>) => Promise<Record<string, unknown>>;

export default class Dispatcher {
  public readonly service: WebSocketServer;

  public readonly api: WebSocketServer;

  public constructor(port: number) {
    this.listenPort = port;
    this.service = createWsServer({
      connectionHandler: this.serviceConnectionHandler.bind(this),
      messageHandler: this.serviceMessageHandler.bind(this),
    });
    this.api = createWsServer({
      connectionHandler: this.apiConnectionHandler.bind(this),
      messageHandler: this.apiMessageHandler.bind(this),
    });
  }

  private async apiConnectionHandler(context: WebSocketContext, params?: Record<string, unknown>): Promise<void> {
    const apiId = context.connection.id;
    if (!params) {
      const res = this.apiResources.get(apiId);
      res.closeService();

      const tm = setTimeout(() => {
        clearTimeout(tm);
        this.apiResources.delete(apiId);
        this.serviceResources.delete(res.service.connection.id);
      }, 10);
      return;
    }

    try {
      const port = await findAvailablePort();
      if (!port) {
        handleLaunchError(context);
        return;
      }

      const tsArgs = `--inspect=127.0.0.1:${port} -r ts-node/register service/main.ts`;
      const args = `${tsArgs} ${this.listenPort} ${apiId}`.split(' ');
      const vs = spawn('node', args, LAUNCH_OPTIONS);
      this.apiResources.set(apiId, new ResManager(context, port));

      vs.stdout.setEncoding('utf8');
      vs.stderr.setEncoding('utf8');
      vs.stdout.on('data', (stdout) => { console.log({ stdout }); });
      vs.stderr.on('data', (stderr) => { console.log({ stderr }); });
      console.info('launched', args, params);
    } catch (e) {
      handleLaunchError(context, e);
    }
  }

  private async apiMessageHandler(context: WebSocketContext, message: MethodMessage): Promise<void> {
    console.log(context.connection.id, message);

    const res = this.apiResources.get(context.connection.id);
    if (!res) return;

    const { id, params } = message;
    try {
      const method = res[message.method] as ResMethod;
      if (method) {
        const result = await method(id, params);
        // console.info('apiMessageHandler', { id, result });
        res.api.connection.respond({ id, result });
      } else {
        console.warn('apiMessageHandler:no_method', message);
        res.api.connection.respond({ id, result: { message } });
      }
    } catch (e) {
      console.error('apiMessageHandler:error', e);
    }
  }

  private async serviceConnectionHandler(context: WebSocketContext, params: Record<string, unknown>): Promise<void> {
    if (!params) return; // TODO: clean up

    console.log('serverConnectionHandler', params);
    const res = this.apiResources.get(params.token as string);
    this.serviceResources.set(context.connection.id, res);

    const response = await phin({ url: `http://127.0.0.1:${res.port}/json`, parse: 'json' });
    const result = await res.setService(context, response.body[0].webSocketDebuggerUrl);

    res.api.connection.send({ method: 'ready', params: result });
    console.log('vad service connected', result);
  }

  private async serviceMessageHandler(context: WebSocketContext, message: AnyMessage): Promise<void> {
    console.log('serviceMessageHandler', context.connection.id, message);

    const res = this.serviceResources.get(context.connection.id);
    if (!res) {
      console.log('not found serviceResources');
      return;
    }

    if (message.method === 'categories') {
      res.api.connection.send(message);
      return;
    }

    if (message.id && message.result && message.result.task) {
      res.api.connection.send({ method: 'task.finished', params: message.result });
    }
  }

  private apiResources = new Map<string, ResManager>();

  private serviceResources = new Map<string, ResManager>();

  private listenPort: number;
}
