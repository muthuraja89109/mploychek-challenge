import express, { ErrorRequestHandler } from 'express';
import cors from 'cors';
import { config } from './config';
import { authRouter } from './routes/auth.routes';
import { usersRouter } from './routes/users.routes';
import { recordsRouter } from './routes/records.routes';

export const app = express();

app.use(cors({ origin: config.clientOrigin }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/records', recordsRouter);

// Last-resort error handler: never leak stack traces to the browser.
const onError: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server.' });
};
app.use(onError);
