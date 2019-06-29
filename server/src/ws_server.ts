import WebSocket from 'ws';
import Koa from 'koa';

import { isDev } from './utils/env_vars';
import { ResponseMessage, MethodMessage } from './types';

function noop() {}

class TimestampId {
  public readonly id: string;

  protected constructor() {
    this.id = Date.now().toString(36);
  }
}

export class WebSocketConnection extends TimestampId {
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
    if (this.terminated) return;

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
    console.log('connected', this.id);
  }

  private pong() {
    this.alive = true;
  }

  private alive = true;

  private terminated = false;
}

export interface WebSocketContext {
  connection: WebSocketConnection;
  server: WebSocketServer;
}

export type ConnectionHandler = (context: WebSocketContext, params?: Record<string, string>)
=> void;
export type MessageHandler = (context: WebSocketContext, message: MethodMessage) => void;
export type ErrorHandler = (context: WebSocketContext, error: Error) => void;

const defaultConnectionHandler: ConnectionHandler = ({ connection: { id: cId }, server: { id: sId } }, params) => console.error(`[${params ? 'connected' : 'disconnected'}] ${sId}.${cId}`, params);

const defaultMessageHandler: MessageHandler = (ctx, message) => {
  const { connection: { id: cId }, server: { id: sId } } = ctx;
  console.info(`[message] ${sId}.${cId}`, message);
  ctx.connection.respond({ id: message.id, result: message.params });
};

const defaultErrorHandler: ErrorHandler = ({ connection: { id: cId }, server: { id: sId } }, error) => console.error(`[error] ${sId}.${cId}`, error);

const PING_INTERVAL = isDev ? 300_000 : 30_000;

interface ServerHandlers {
  connectionHandler?: ConnectionHandler;
  messageHandler?: MessageHandler;
  errorHandler?: ErrorHandler;
}

export class WebSocketServer extends TimestampId {
  public connectionHandler: ConnectionHandler;

  public messageHandler: MessageHandler;

  public errorHandler: ErrorHandler;

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
      const context = { connection: conn, server: this };

      connection.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString()) as MethodMessage;
          this.messageHandler(context, msg);
        } catch (error) {
          this.errorHandler(context, error);
        }
      });

      connection.on('close', (code, reason) => {
        console.log('closed', this.id, { code, reason });
        this.connectionHandler(context);
        conn.disconnect();
      });

      this.connections.set(conn.id, conn);
      this.connectionHandler(context, ctx.params);
    });
    ctx.respond = false;
    return null;
  }

  public findConnection(id: string): WebSocketConnection {
    return this.connections[id];
  }

  public constructor(handlers: ServerHandlers = {}) {
    super();
    this.server = new WebSocket.Server({
      noServer: true,
      perMessageDeflate: true,
    });

    this.messageHandler = handlers.messageHandler || defaultMessageHandler;
    this.connectionHandler = handlers.connectionHandler || defaultConnectionHandler;
    this.errorHandler = handlers.errorHandler || defaultErrorHandler;

    this.timer = setInterval(this.heartbeat.bind(this), PING_INTERVAL);
    this.entryPoint = this.entryPoint.bind(this);
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

export default (handlers?: ServerHandlers) => new WebSocketServer(handlers);
