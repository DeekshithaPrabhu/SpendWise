import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import routes from './routes';
import { errorHandler, notFound } from './middleware/error.middleware';

const app = express();

app.disable('x-powered-by');

if (env.trustProxy) {
    app.set('trust proxy', env.trustProxy === 'true' ? true : Number(env.trustProxy) || env.trustProxy);
}

app.use(helmet());
// app.use(cors({ origin: env.clientUrl }));
app.use(
    cors({
        origin: (origin, callback) => {
            // Requests with no Origin header (Postman, curl, server-to-server) are allowed
            if (!origin) return callback(null, true);

            if (env.allowedOrigins.includes(origin.replace(/\/$/, ''))) {
                return callback(null, true);
            }

            console.warn('CORS blocked origin:', origin);
            return callback(new Error('Origin not allowed by CORS'));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

export default app;
