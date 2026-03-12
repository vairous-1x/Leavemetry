import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import leaveRoutes from './routes/leaves.js';
import holidayRoutes from './routes/holidays.js';
import statsRoutes from './routes/stats.js';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/leavemetry';
const PORT = process.env.PORT || 5000;

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/stats', statsRoutes);

mongoose.connect(MONGO_URI).then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
}).catch(err => console.error('MongoDB error:', err));
