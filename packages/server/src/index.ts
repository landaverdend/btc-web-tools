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

const BASE_URL = 'https://blockstream.info/api/';
const BASE_TESTNET_URL = 'https://blockstream.info/testnet/api/';

app.get('/tx/:txid', async (req, res) => {
  const { txid } = req.params;
  const { testnet } = req.query;

  const useTestnet = testnet === 'true';
  const accessToken = await TokenFetcher.getToken();
  const url = `${useTestnet ? BASE_TESTNET_URL : BASE_URL}tx/${txid}/hex`;

  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  try {
    const response = await fetch(url, options);
    const data = await response.text();
    res.status(200).send(data);
  } catch (error) {
    console.error('Error fetching tx: ', error);
    res.status(500).send('Error fetching tx');
  }
});

app.get('/', (_, res) => {
  res.send('Hello World');
});
