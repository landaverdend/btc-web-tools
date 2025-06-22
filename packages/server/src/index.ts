import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

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

app.get('/', (_, res) => {
  res.send('Hello World');
});
