import express from 'express';
import cors from 'cors';
import { ensureWorkspace } from './bootstrap.js';
import {
  projectFilesRouter,
  resetWorkspace,
} from './routes/projectFiles.js';
import { submissionsRouter } from './routes/submissions.js';

const PORT = Number(process.env.PORT ?? 3001);

ensureWorkspace();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/project-files', projectFilesRouter());
app.use('/api/submissions', submissionsRouter());

app.post('/api/reset', (_req, res) => {
  try {
    resetWorkspace();
    res.json({ status: 'ok' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'reset failed' });
  }
});

app.listen(PORT, () => {
  console.log(`together backend listening on http://localhost:${PORT}`);
});
