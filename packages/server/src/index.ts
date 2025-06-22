import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { TokenFetcher } from './token';

dotenv.config();

const PORT = process.env['PORT'] || 3001;

const app = express();

const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get('/tx', async (_, res) => {
  const url = 'https://enterprise.blockstream.info/api/blocks/tip/hash';
  const accessToken = await TokenFetcher.getToken();

  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  fetch(url, options)
    .then((response) => response.text()) // Use response.json() if it's JSON
    .then((data) => console.log(data))
    .catch((error) => console.error('Error:', error));
});

app.get('/', (_, res) => {
  res.send('Hello World');
});
