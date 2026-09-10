import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Allow up to 50MB payload for custom audio base64
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // In-memory store for shared pranks across devices
  const pranksStore = new Map<string, any>();

  // API to save prank configuration + custom audio
  app.post('/api/pranks', (req, res) => {
    const { id, config } = req.body;
    if (!id || !config) {
      return res.status(400).json({ error: 'Missing id or config' });
    }
    pranksStore.set(id, config);
    res.json({ success: true, id });
  });

  // API to retrieve prank configuration + custom audio
  app.get('/api/pranks/:id', (req, res) => {
    const prank = pranksStore.get(req.params.id);
    if (!prank) {
      return res.status(404).json({ error: 'Prank not found' });
    }
    res.json(prank);
  });

  // Health endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', count: pranksStore.size });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
