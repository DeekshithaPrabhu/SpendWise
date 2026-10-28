import type { Request, Response } from 'express';
import app from '../src/app';
import { connectDB } from '../src/config/db';

// Vercel serverless entry point: no app.listen() here, Vercel invokes this handler per request.
export default async function handler(req: Request, res: Response) {
  try {
    await connectDB();
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    return res.status(503).json({ message: 'Database temporarily unavailable' });
  }
  return app(req, res);
}
