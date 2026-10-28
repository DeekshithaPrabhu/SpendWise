import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

// Local / traditional hosting (Render, Railway, VPS). On Vercel, api/index.ts is used instead.
connectDB()
  .then(() => {
    console.log('MongoDB connected');
    app.listen(env.port, () => console.log(`SpendWise API on http://localhost:${env.port}`));
  })
  .catch((err) => {
    console.error('DB connection failed', err);
    process.exit(1);
  });
