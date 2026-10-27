import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

connectDB()
  .then(() => app.listen(env.port, () => console.log(`SpendWise API on http://localhost:${env.port}`)))
  .catch((err) => {
    console.error('DB connection failed', err);
    process.exit(1);
  });
