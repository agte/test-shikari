const Koa = require('koa');
const serve = require('koa-static');
const koaBody = require('koa-body');
const Router = require('koa-router');
const request = require('request-promise-native');

const port = process.env.PORT || 3000;
const app = new Koa();
app.use(serve('public'));

app.use(
  // error handler to send all errors in JSON format
  async (ctx, next) => next()
    .catch((e) => {
      ctx.type = 'json';
      ctx.status = e.statusCode || 500;
      ctx.body = {
        message: e.message,
      };
    }),
);

const router = new Router();

const regexp = /<link [^>]*href=['"](.*?\.css)['"][^>]*>|<script [^>]*src=['"](.*?)['"][^>]*>/gi;

router.post('/parse', koaBody(), async (ctx) => {
  const { pageUrl } = ctx.request.body;
  if (!pageUrl) {
    ctx.throw(400, '"pageUrl" required');
  }

  let htmlContent;

  try {
    htmlContent = await request(pageUrl);
  } catch (e) {
    ctx.throw(400, 'Crawling failed. Try another url.');
  }

  const result = Array
    .from(htmlContent.matchAll(regexp))
    .map((matches) => matches[2] || matches[1]);

  ctx.body = result;
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(port, () => {
  console.log(`Server is listening port ${port}`); // eslint-disable-line no-console
});
