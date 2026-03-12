import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/leavemetry';

async function seed() {
  await mongoose.connect(MONGO_URI);
  const existing = await User.findOne({ email: 'admin@gmail.com' });
  if (existing) {
    console.log('Admin already exists');
    process.exit(0);
    return;
  }
  await User.create({
    username: 'admin',
    email: 'admin@gmail.com',
    password: 'admin123',
    role: 'admin',
  });
  console.log('Admin created: admin@gmail.com / admin123');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
