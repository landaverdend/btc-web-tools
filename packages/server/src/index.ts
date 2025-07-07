import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { TokenFetcher } from './token.js';
import { ResponseCache } from './ResponseCache.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env['PORT'] || 3000;

const app = express();

const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Serve static files from the public directory
app.use(express.static('public'));

// Catch all other routes and return the index.html file
app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const BASE_URL = 'https://blockstream.info/api/';
const BASE_TESTNET_URL = 'https://blockstream.info/testnet/api/';

// Initialize the FIFO cache with a reasonable size limit
const responseCache = new ResponseCache(1000);

app.get('/tx/:txid', async (req, res) => {
  const { txid } = req.params;
  const { testnet } = req.query;

  const useTestnet = testnet === 'true';

  // Generate cache key that includes testnet flag
  const cacheKey = txid;

  // Check cache first
  const cachedResult = responseCache.get(cacheKey);
  if (cachedResult) {
    res.status(200).send(cachedResult);
    return;
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
    responseCache.set(cacheKey, result);

    res.status(200).send(result);
  } catch (error) {
    const errortxt = error instanceof Error ? error.message : 'Generic error';
    res.status(500).send(errortxt);
  }
});

app.get('/address/:address/utxo', async (req, res) => {
  const { address } = req.params;
  const { testnet } = req.query;

  const useTestnet = testnet === 'true';
  const accessToken = await TokenFetcher.getToken();

  const url = `${useTestnet ? BASE_TESTNET_URL : BASE_URL}address/${address}/utxo`;

  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  console.log(url);

  try {
    const response = await fetch(url, options);

    if (response.status !== 200) {
      console.log(response);
      throw new Error(`Fetch failed: ${response.statusText}`);
    }

    const data = await response.json();

    console.log(data);
    res.status(200).send(data);
  } catch (error) {
    const errortext = error instanceof Error ? error.message : 'Generic Error';
    console.error(errortext);
    res.status(500).send(errortext);
  }
});
