import 'dotenv/config';
import express from 'express';

const app = express();
const port = Number(process.env.PORT ?? 1414);

app.use(express.json());

app.get('/', (_request, response) => {
  response.json({ message: 'AniKeeper API is running.' });
});

app.listen(port, () => {
  console.log(`AniKeeper API listening on port ${port}.`);
});
