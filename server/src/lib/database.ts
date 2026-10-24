import mongoose from 'mongoose';

export async function connectDatabase(): Promise<void> {
  const databaseUrl = process.env.MONGODB_URI;

  if (!databaseUrl) {
    throw new Error('MONGODB_URI is not configured.');
  }

  await mongoose.connect(databaseUrl);
  console.log('Connected to MongoDB.');
}
