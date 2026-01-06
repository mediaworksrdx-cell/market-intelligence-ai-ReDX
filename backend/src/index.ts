
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { scanRoutes } from './routes/scanRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- API ROUTES ---
app.use('/api/v1/scan', scanRoutes);
// app.use('/api/v1/auth', authRoutes); // Placeholder for auth
// app.use('/api/v1/watchlist', watchlistRoutes); // Placeholder for watchlist

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
