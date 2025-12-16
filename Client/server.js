import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createServer(root = process.cwd(), isProd = process.env.NODE_ENV === 'production') {
  const resolve = (p) => path.resolve(root, p);
  const app = express();

  if (!isProd) {
    // dev: use Vite's middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      root,
      logLevel: 'info',
      server: { middlewareMode: 'ssr' },
    });

    app.use(vite.middlewares);

    app.use('*', async (req, res) => {
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(resolve('index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);

        const { render } = await vite.ssrLoadModule('/src/entry-server.jsx');

        let didError = false;

        const stream = render(url, {
          onShellReady() {
            res.status(didError ? 500 : 200);
            res.setHeader('Content-Type', 'text/html');
            const pipe = stream.pipe(res);
          },
          onShellError(err) {
            vite.ssrFixStacktrace(err);
            res.status(500).end(err.message);
          },
          onError(err) {
            didError = true;
            console.error(err);
          },
        });
      } catch (e) {
        vite.ssrFixStacktrace(e);
        console.error(e);
        res.status(500).end(e.message);
      }
    });
  } else {
    // production: serve pre-built assets
    const distClient = resolve('dist/client');
    app.use(express.static(distClient, { index: false }));

    app.use('*', async (req, res) => {
      try {
        const url = req.originalUrl;
        const template = fs.readFileSync(path.join(distClient, 'index.html'), 'utf-8');
        const { render } = await import(path.join(root, 'dist/server/entry-server.js'));

        let didError = false;

        const stream = render(url, {
          onShellReady() {
            res.status(didError ? 500 : 200);
            res.setHeader('Content-Type', 'text/html');
            stream.pipe(res);
          },
          onShellError(err) {
            console.error(err);
            res.status(500).end(err.message);
          },
          onError(err) {
            didError = true;
            console.error(err);
          },
        });
      } catch (e) {
        console.error(e);
        res.status(500).end(e.message);
      }
    });
  }

  return { app };
}

// start
const port = process.env.PORT || 3000;
createServer(process.cwd(), process.env.NODE_ENV === 'production')
  .then(({ app }) =>
    app.listen(port, () => console.log(`SSR server running at http://localhost:${port}`))
  )
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
