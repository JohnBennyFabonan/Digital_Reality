import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());

app.get('/api', (req, res) => {
  res.json({ message: 'Hello from Node backend!' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
