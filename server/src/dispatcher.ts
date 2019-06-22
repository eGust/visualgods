import { resolve } from 'path';
import { spawn } from 'child_process';
import { createServer } from 'net';

import createWsServer, {
  WebSocketServer, WebSocketContext, MethodMessage,
} from './ws_server';
import Debugger from './debugger';

const MIN_PORT = 9527;
const MAX_PORT = 29_527;
const usedPort = new Set<number>();

function checkPortAvailable(port: number) {
  return new Promise<boolean>((rsv) => {
    const srv = createServer();
    srv.on('error', () => {
      rsv(false);
    });
    srv.on('listening', () => {
      rsv(true);
      srv.close();
    });
    srv.listen(port, '127.0.0.1');
  });
}

async function findAvailablePort(from: number = MIN_PORT) {
  for (let port = from; port < MAX_PORT; port += 1) {
    // eslint-disable-next-line no-await-in-loop
    if (!usedPort.has(port) && await checkPortAvailable(port)) return port;
  }
  return null;
}

export class ResourceManager {
  public readonly api: WebSocketContext;

  public readonly port: number;

  public get inspector() { return this.debugger; }

  public get service() { return this.vs; }

  public set service(val: WebSocketContext) {
    this.vs = val;
    this.debugger = new Debugger(this.vs.connection, this.debugWsUrl);
  }

  public constructor(api: WebSocketContext, port: number, debugWsUrl: string) {
    this.api = api;
    this.port = port;
    this.debugWsUrl = debugWsUrl;
  }

  private vs: WebSocketContext;

  private debugWsUrl: string;

  private debugger: Debugger;
}

function handleLaunchError(context: WebSocketContext, error?: Error) {
  const { server: { id: sId }, connection: { id: cId } } = context;
  console.error(`[launch] ${sId}.${cId}`, error);
}

const LAUNCH_OPTIONS = { cwd: resolve(__dirname, '../../lib/service') };

export class Dispatcher {
  public readonly service: WebSocketServer;

  public readonly api: WebSocketServer;

  public constructor(port: number) {
    this.listenPort = port;
    this.service = createWsServer({
      connectionHandler: this.serviceConnectionHandler.bind(this),
      // messageHandler: this.serverMessageHandler.bind(this),
    });
    this.api = createWsServer({
      connectionHandler: this.apiConnectionHandler.bind(this),
      messageHandler: this.apiMessageHandler.bind(this),
    });
  }

  private async apiConnectionHandler(context: WebSocketContext, params?: Record<string, any>) {
    const apiId = context.connection.id;
    if (!params) {
      const res = this.apiResources.get(apiId);
      res.service.connection.disconnect();

      usedPort.delete(res.port);
      this.apiResources.delete(apiId);
      this.serviceResources.delete(res.service.connection.id);
      return;
    }

    try {
      const port = await findAvailablePort();
      if (!port) {
        handleLaunchError(context);
        return;
      }

      const tsArgs = `--inspect=127.0.0.1:${port} -r ts-node/register src/main.ts`;
      const args = `${tsArgs} ${this.listenPort} ${apiId}`.split(' ');
      const vs = spawn('node', args, LAUNCH_OPTIONS);
      usedPort.add(port);

      vs.stdout.setEncoding('utf8');
      vs.stderr.setEncoding('utf8');
      vs.stdout.on('data', (stdout) => {
        console.log('vs.on[data]', stdout);
      });
      vs.stderr.on('data', (stderr) => {
        console.log({ stderr });
        if (this.apiResources.has(apiId)) return;

        const m = stderr.match(/(ws:\S+)/);
        console.info('ws', m && m[1]);
        if (!m) return;

        this.apiResources.set(apiId, new ResourceManager(context, port, m[1]));
      });
      console.info('launched', args, params);
    } catch (e) {
      handleLaunchError(context, e);
    }
  }

  private serviceConnectionHandler(context: WebSocketContext, params?: Record<string, any>) {
    if (!params) {
      // clean up
      return;
    }

    console.log('serverConnectionHandler', params);
    const res = this.apiResources.get(params.token);
    res.service = context;
    this.serviceResources.set(context.connection.id, res);
    console.log('vad service connected');
  }

  private async apiMessageHandler(context: WebSocketContext, message: MethodMessage) {
    console.log(context.connection.id, message);

    const res = this.apiResources.get(context.connection.id);
    if (!res) return;

    switch (message.method) {
      case 'inspect': {
        const { method, ...data } = message.data;
        const result = await res.inspector.inspect(message.id, method, data);
        res.api.connection.respond({ id: message.id, result });
        break;
      }
      default:
    }
  }

  private apiResources = new Map<string, ResourceManager>();

  private serviceResources = new Map<string, ResourceManager>();

  private listenPort: number;
}
