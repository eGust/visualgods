import { env } from 'process';
import { resolve } from 'path';
import Koa from 'koa';
import serve from 'koa-static';
import logger from 'koa-logger';
import Router from 'koa-router';

import { NODE_ENV } from './node_env';
import { dispatcher } from './dispatcher';

const hostname = env.HOST || '127.0.0.1';
const port = +(env.PORT || '3333');

function startServer() {
  console.info(`NODE_ENV: ${NODE_ENV}`);
  const app = new Koa();
  const router = new Router();

  app.use(logger());
  app.use(serve(resolve(__dirname, '../web')));

  router.get('/api', dispatcher.client.entryPoint);
  router.get('/visualgods', dispatcher.server.entryPoint);
  app.use(router.routes());

  try {
    app.listen(port, hostname);
    console.log(`Server listening on http://${hostname}:${port}`);
  } catch (err) {
    console.log(`Failed to start server on ${hostname}:${port}`);
    console.error(err);
  }
}

startServer();
