import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { ResponseCache } from './ResponseCache.js';
import { ElectrumPool } from './electrumPool.js';
import * as bitcoin from 'bitcoinjs-lib';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env['PORT'] || '3000', 10);

const app = express();

const electrumPool = new ElectrumPool();

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
    const electrumClient = await electrumPool.getConnection();
    const initialTxResult = await electrumClient.getTx(txid);

    const initialTx = bitcoin.Transaction.fromHex(initialTxResult);

    // Grab the associated parent TXs for each input...
    const parents: Record<string, string> = {};
    for (const input of initialTx.ins) {
      const prevTxId = Buffer.from(input.hash).reverse().toString('hex'); 
      const raw = await electrumClient.getTx(prevTxId);
      parents[prevTxId] = raw;
    }

    const response = {
      hex: initialTxResult,
      parents 
    }

    res.status(200).send(response);

    responseCache.set(cacheKey, response);
  } catch (error) {
    const errortxt = error instanceof Error ? error.message : 'Generic error';
    res.status(500).send(errortxt);
  }
});

// Serve static files from the public directory
app.use(express.static('public'));

// Catch all other routes and return the index.html file
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on 0.0.0.0:${PORT}`);
});
