import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { TokenFetcher } from './token';
import { TxCache } from './TxCache';

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

// Initialize the FIFO cache with a reasonable size limit
const txCache = new TxCache(1000);

app.get('/tx/:txid', async (req, res) => {
  const { txid } = req.params;
  const { testnet } = req.query;

  const useTestnet = testnet === 'true';

  // Generate cache key that includes testnet flag
  const cacheKey = `${txid}-${useTestnet ? 'testnet' : 'mainnet'}`;

  // Check cache first
  const cachedResult = txCache.get(cacheKey);
  if (cachedResult) {
    console.log('cache hit');
    return res.status(200).send(cachedResult);
  }

  // If not in cache, fetch from API
  const accessToken = await TokenFetcher.getToken();
  const jsonUrl = `${useTestnet ? BASE_TESTNET_URL : BASE_URL}tx/${txid}`;
  const hexUrl = `${useTestnet ? BASE_TESTNET_URL : BASE_URL}tx/${txid}/hex`;

  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  try {
    const jsonResponse = await fetch(jsonUrl, options);
    const hexResponse = await fetch(hexUrl, options);

    if (jsonResponse.status !== 200) {
      throw new Error(`Fetch failed: ${jsonResponse.statusText}`);
    }
    if (hexResponse.status !== 200) {
      throw new Error(`Fetch failed: ${hexResponse.statusText}`);
    }

    const data = await jsonResponse.json();
    const hexData = await hexResponse.text();

    const result = {
      serializedTx: hexData,
      txJson: data,
    };

    // Cache the result
    txCache.set(cacheKey, result);

    res.status(200).send(result);
  } catch (error) {
    const errortxt = error instanceof Error ? error.message : 'Generic error';
    res.status(500).send(errortxt);
  }
});

app.get('/', (_, res) => {
  res.send('Hello World');
});
