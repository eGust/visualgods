import { resolve } from 'path';
import { exec } from 'child_process';
import { createServer } from 'net';

import createWsServer, {
  WebSocketServer, WebSocketContext, MethodMessage,
} from './ws_server';

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
  public readonly client: WebSocketContext;

  public server: WebSocketContext;

  public constructor(client: WebSocketContext, debugWsUrl: string) {
    this.client = client;
    this.debugWsUrl = debugWsUrl;
  }

  private debugWsUrl: string;
}

function handleLaunchError(context: WebSocketContext, error?: Error) {
  const { server: { id: sId }, connection: { id: cId } } = context;
  console.error(`[launch] ${sId}.${cId}`, error);
}

const LAUNCH_OPTIONS = { cwd: resolve(__dirname, '../../lib/service') };

class Dispatcher {
  public readonly server: WebSocketServer;

  public readonly client: WebSocketServer;

  public constructor() {
    this.server = createWsServer({
      messageHandler: this.serverMessageHandler.bind(this),
    });
    this.client = createWsServer({
      connectedHandler: this.clientConnectedHandler.bind(this),
    });
  }

  private async clientConnectedHandler(context: WebSocketContext) {
    try {
      const port = await findAvailablePort();
      if (!port) {
        handleLaunchError(context);
        return;
      }

      const clientId = context.connection.id;
      const cmd = `node --inspect=127.0.0.1:${port} -r ts-node/register src/main.ts`;
      exec([cmd, clientId].join(' '), LAUNCH_OPTIONS, (error, _stdout, stderr) => {
        if (error) handleLaunchError(context, error);

        usedPort.add(port);
        const m = stderr.match(/(ws:\S+)/);
        this.resources.set(clientId, new ResourceManager(context, m ? m[1] : null));
      });
    } catch (e) {
      handleLaunchError(context, e);
    }
  }

  private serverMessageHandler(context: WebSocketContext, message: MethodMessage) {
    if (message.method === 'pair') {
      const res = this.resources[message.data.clientId];
      res.server = context;
      // this.serviceResources.set(context.connection.id, res);
      // attach debugger
      // return;
    }

    // const res = this.serviceResources[context.connection.id];
    switch (message.method) {
      case 'quit': {
        // clean up?
        break;
      }
      default:
    }
  }

  private resources = new Map<string, ResourceManager>();

  // private serviceResources = new Map<string, ResourceManager>();
}

export const dispatcher = new Dispatcher();
