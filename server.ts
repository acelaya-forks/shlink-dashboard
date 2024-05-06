import { createRequestHandler } from '@remix-run/express';
import express from 'express';
import { isProd } from './app/utils/env.server';

const viteDevServer = isProd()
  ? null
  : await import('vite').then(
    (vite) =>
      vite.createServer({
        server: { middlewareMode: true },
      }),
  );

const app = express();
app.use(
  viteDevServer
    ? viteDevServer.middlewares
    : express.static('build/client'),
);

const build = viteDevServer
  ? () => viteDevServer.ssrLoadModule('virtual:remix/server-build')
  : await import('./build/server/index.js');

app.all('*', createRequestHandler({ build }));

// FIXME For some reason, this doesn't work here, so it's set conditionally in root's loader. Investigate.
// await appDataSource.initialize();

app.listen(3005, () => console.log('App listening on http://localhost:3005'));
