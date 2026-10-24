import 'dotenv/config';
import express from 'express';
import { errorHandler } from './middleware/error-handler.js';
import { connectDatabase } from './lib/database.js';
import { apiRouter } from './routes/routes.js';

const app = express();
const port = Number(process.env.PORT ?? 1414);

app.use(express.json());
app.use('/api', apiRouter);

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
