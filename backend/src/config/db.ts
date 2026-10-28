import mongoose from 'mongoose';
import { env } from './env';

let connecting: Promise<typeof mongoose> | null = null;

/** Safe to call on every request: reuses an open connection (needed for serverless hosts like Vercel). */
export async function connectDB(): Promise<void> {
  if (mongoose.connection.readyState === 1) return;

  if (!connecting) {
    connecting = mongoose.connect(env.mongoUri).catch((err) => {
      connecting = null; // allow a retry on the next request
      throw err;
    });
  }
  await connecting;
}
