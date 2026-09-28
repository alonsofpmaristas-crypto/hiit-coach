import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';

export function createApp() {
  const app = express();
  app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use('/api', routes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
