import * as Koa from 'koa';
import * as views from 'koa-views';
import * as bodyParser from 'koa-bodyparser'
import * as KoaLogger from 'koa-logger';
import * as path from "path";

const swagger = require('swagger-injector');

import { router as index } from './routes/index';
const app: Koa = new Koa();

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  // const ms = new Date() - start;
  // console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// middlewares
app.use(async (ctx, next) => {
  const req: any = ctx.req;
  req.rawBody = '';

  await new Promise((res, rej) => {
    req.setEncoding('utf8');

    req.on('data', (chunk) => {
      req.rawBody += chunk;
    });

    req.on('end', () => {
      res();
    });
  });
  await next();
});
// app.use(bodyParser());
app.use(KoaLogger());
// const publicPath = path.join(__dirname + '/../public');
// const viewPath = path.join(__dirname + '/../views');
// app.use(require('koa-static')(publicPath));

// app.use(views(viewPath, {
//   extension: 'pug'
// }));

// const swaggerDocument = path.join(__dirname, '/../apidoc.json');
// app.use(swagger.koa({
//   path: swaggerDocument,
//   prefix: '',
//   route: '/docs'
// }));

// routes
app.use(index.routes())
.use(index.allowedMethods());

export default app;
