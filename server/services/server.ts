import { env } from 'process';
import { resolve } from 'path';
import Koa from 'koa';
import serve from 'koa-static';
import logger from 'koa-logger';
import Router from 'koa-router';

const hostname = env.HOST || '127.0.0.1';
const port = +(env.PORT || '3333');

function startServer() {
  const app = new Koa();
  const router = new Router();

  app.use(logger());
  app.use(serve(resolve(__dirname, '../web')));

  // router.get('/log', connectLogger);
  app.use(router.routes());

  app.listen(port, hostname);
  console.log(`Server listening on http://${hostname}:${port}`);
}

startServer();
