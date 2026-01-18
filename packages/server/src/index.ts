import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { ResponseCache } from './ResponseCache.js';
import { ElectrumClient } from './electrumClient.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env['PORT'] || '3000', 10);

const app = express();


const electrumClient = new ElectrumClient("electrum.blockstream.info", 50002, true);
electrumClient.connect()

// Environment-based CORS configuration
function getAllowedOrigins(): string[] {
  const isDev = process.env['NODE_ENV'] === 'development';

  console.log('isDev', isDev);
  // Base origins for landaverde.io
  const baseOrigins = ['https://landaverde.io', 'http://landaverde.io'];

  // Add localhost origins for development
  const developmentOrigins = isDev ? ['http://localhost:3000', 'http://127.0.0.1:3000'] : [];
  console.log('developmentOrigins', developmentOrigins);

  // Combine all origins and remove duplicates
  const allOrigins = [...baseOrigins, ...developmentOrigins];
  return [...new Set(allOrigins)];
}

const allowedOrigins = getAllowedOrigins();

app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

const BASE_URL = 'https://blockstream.info/api/';
const BASE_TESTNET_URL = 'https://blockstream.info/testnet/api/';

// Initialize the FIFO cache with a reasonable size limit
const responseCache = new ResponseCache(1000);

app.get('/tx/:txid', async (req, res) => {
  const { txid } = req.params;
  const cacheKey = txid;

  const cachedResult = responseCache.get(cacheKey);
  if (cachedResult) {
    res.status(200).send(cachedResult);
    return;
  }

  try {
    const result = await electrumClient.getTx(txid);

    // TODO: Convert the rawTX to JSON prettified format

    res.status(200).send(result);

    responseCache.set(cacheKey, result);
  } catch (error) {
    const errortxt = error instanceof Error ? error.message : 'Generic error';
    res.status(500).send(errortxt);
  }
});

// app.get('/address/:address/utxo', async (req, res) => {
//   const { address } = req.params;
//   const { testnet } = req.query;

//   const useTestnet = testnet === 'true';
//   const accessToken = await TokenFetcher.getToken();

//   const url = `${useTestnet ? BASE_TESTNET_URL : BASE_URL}address/${address}/utxo`;

//   const options = {
//     method: 'GET',
//     headers: {
//       Authorization: `Bearer ${accessToken}`,
//     },
//   };

//   try {
//     const response = await fetch(url, options);

//     if (response.status !== 200) {
//       throw new Error(`Fetch failed: ${response.statusText}`);
//     }

//     const data = await response.json();

//     // add scriptpubkey to data each utxo...
//     const toRet = [];
//     for (const utxo of data) {
//       const txJson = await fetchTx(utxo.txid, { type: 'json', testnet: useTestnet });
//       const txJsonData = await txJson.json();

//       const scriptpubkey = txJsonData.vout[utxo.vout].scriptpubkey;
//       toRet.push({ ...utxo, scriptpubkey });
//     }

//     res.status(200).send(toRet);
//   } catch (error) {
//     const errortext = error instanceof Error ? error.message : 'Generic Error';
//     console.error(errortext);
//     res.status(500).send(errortext);
//   }
// });

// Serve static files from the public directory
app.use(express.static('public'));

// Catch all other routes and return the index.html file
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on 0.0.0.0:${PORT}`);
});
