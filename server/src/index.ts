import 'dotenv/config';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { errorHandler } from './middleware/error-handler.js';
import { connectDatabase } from './lib/database.js';
import { apiRouter } from './routes/routes.js';

const app = express();
const port = Number(process.env.PORT ?? 1414);
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Muitas requisições. Tente novamente em alguns minutos.' },
});

app.use(express.json());
app.use('/api', apiRateLimiter, apiRouter);

app.get('/', (_request, response) => {
  response.json({ message: 'AniKeeper API is running.' });
});

app.use(errorHandler);

async function startServer(): Promise<void> {
  await connectDatabase();

  app.listen(port, () => {
    console.log(`AniKeeper API listening on port ${port}.`);
  });
}

void startServer().catch((error: unknown) => {
  console.error('Failed to start AniKeeper API:', error);
  process.exitCode = 1;
});
