import { env } from 'process';
import WebSocket from 'ws';
import Koa from 'koa';

import { isDev } from './node_env';

function noop() {}

class TimestampId {
  public readonly id: string;

  protected constructor() {
    this.id = Date.now().toString(36);
  }
}

interface ResponseMessage {
  id: number;
  data: Record<string, any>;
}

interface MethodMessage extends ResponseMessage {
  method: string;
}

class WebSocketConnection extends TimestampId {
  public readonly connection: WebSocket;

  public get isTerminated() { return this.terminated; }

  public ping() {
    if (!this.alive) {
      this.disconnect();
      return;
    }

    this.alive = false;
    this.connection.ping(noop);
  }

  public send(message: MethodMessage) {
    this.connection.send(JSON.stringify(message));
  }

  public respond(response: ResponseMessage) {
    this.connection.send(JSON.stringify(response));
  }

  public disconnect() {
    console.log('disconnected', this.id);
    this.terminated = true;
    this.connection.terminate();
  }

  public constructor(connection: WebSocket) {
    super();
    this.connection = connection;
    connection.on('pong', this.pong.bind(this));
    connection.on('error', (error) => {
      console.error(this.id, error);
      // this.disconnect();
    });
    connection.on('close', (code, reason) => {
      console.log('closed', this.id, { code, reason });
      this.disconnect();
    });
    console.log('connected', this.id);
  }

  private pong() {
    this.alive = true;
  }

  private alive = true;

  private terminated = false;
}

type MessageHandler = (connection: WebSocketConnection, message: MethodMessage) => void;
type ErrorHandler = (connection: WebSocketConnection, error: Error) => void;

const defaultMessageHandler: MessageHandler = (connection, message) => {
  console.info('message', connection.id, message);
  connection.respond(message);
};

const defaultErrorHandler: ErrorHandler = ({ id }, error) => console.error(id, error);

const PING_INTERVAL = isDev ? 60_000 : 15_000;

class WebSocketServer extends TimestampId {
  public messageHandler: MessageHandler;

  public errorHandler: ErrorHandler = defaultErrorHandler;

  public readonly server: WebSocket.Server;

  public get isTerminated() { return this.terminated; }

  public stop() {
    if (this.terminated) return;

    this.terminated = true;
    clearInterval(this.timer);
    this.connections.forEach((conn) => {
      conn.disconnect();
    });
    this.connections.clear();
    this.server.close();
  }

  public entryPoint(ctx: Koa.ParameterizedContext) {
    const { request, socket } = ctx;
    this.server.handleUpgrade(request.req, socket, Buffer.alloc(0), (connection) => {
      const conn = new WebSocketConnection(connection);
      this.connections.set(conn.id, conn);
      connection.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString()) as MethodMessage;
          this.messageHandler(conn, msg);
        } catch (error) {
          this.errorHandler(conn, error);
        }
      });
    });
    ctx.respond = false;
    return null;
  }

  public constructor(messageHandler?: MessageHandler) {
    super();
    this.server = new WebSocket.Server({
      noServer: true,
      perMessageDeflate: true,
    });

    this.timer = setInterval(this.heartbeat.bind(this), PING_INTERVAL);
    this.entryPoint = this.entryPoint.bind(this);
    this.messageHandler = messageHandler || defaultMessageHandler;
  }

  private heartbeat() {
    const connections = [...this.connections.values()];
    const terminated = connections.filter((conn) => {
      const r = conn.isTerminated;
      if (!r) {
        conn.ping();
      }
      return r;
    });

    terminated.forEach(({ id }) => {
      this.connections.delete(id);
    });
  }

  private timer: NodeJS.Timeout;

  private connections = new Map<string, WebSocketConnection>();

  private terminated = false;
}

export default () => new WebSocketServer();
