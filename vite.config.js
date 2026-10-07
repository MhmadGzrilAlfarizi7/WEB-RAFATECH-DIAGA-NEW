import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

const vercelApiPlugin = () => ({
  name: 'vercel-api-plugin',
  configureServer(server) {
    server.middlewares.use('/api/chat', async (req, res, next) => {
      if (req.method === 'POST' || req.method === 'OPTIONS') {
        const env = loadEnv('', process.cwd(), '');
        Object.assign(process.env, env);
        
        res.status = (code) => {
          res.statusCode = code;
          return res;
        };
        res.json = (data) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        };

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          if (body) {
            try { req.body = JSON.parse(body); } catch (e) { req.body = {}; }
          }
          try {
            const chatHandler = await import('./api/chat.js');
            await chatHandler.default(req, res);
          } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
          }
        });
      } else {
        next();
      }
    });
  }
});

export default defineConfig({
  plugins: [vercelApiPlugin()],
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        belajar: resolve(__dirname, 'pages/belajar.html'),
        'pemandu-ai': resolve(__dirname, 'pages/pemandu-ai.html'),
        batik: resolve(__dirname, 'pages/batik.html'),
        'sentra-kreatif': resolve(__dirname, 'pages/sentra-kreatif.html'),
        tentang: resolve(__dirname, 'pages/tentang.html'),
        '404': resolve(__dirname, 'pages/404.html'),
      },
    },
    assetsDir: 'assets',
    sourcemap: false,
  },
  server: {
    port: 5173,
    open: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});