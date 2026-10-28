import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
// const express = require("express");
// const { securityHeaders, sameOriginOnly } = require("./middleware/security");
// const cors = require("cors");
connectDB()
  .then(() => app.listen(env.port, () => console.log(`SpendWise API on http://localhost:${env.port}`)))
  .catch((err) => {
    console.error('DB connection failed', err);
    process.exit(1);
  });

// // =====================================================
// // 1. Environment configuration
// // =====================================================


// const allowedOrigins = (process.env.CLIENT_ORIGIN || process.env.clientUrl || '')
//   .split(',')
//   .map((o) => o.trim().replace(/\/$/, ''))
//   .filter(Boolean);

// // Configure trusted proxy only when explicitly specified.
// if (process.env.TRUST_PROXY) {
//   app.set(
//     "trust proxy",
//     process.env.TRUST_PROXY === "true"
//       ? true
//       : Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY,
//   );
// }

// app.disable("x-powered-by");

// // =====================================================
// // 2. Security and CORS middleware
// // =====================================================

// app.use(securityHeaders);

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       // Allow requests without Origin, such as certain server-to-server calls.
//       if (!origin) {
//         return callback(null, true);
//       }

//       const normalizedOrigin = origin.replace(/\/$/, "");

//       if (allowedOrigins.includes(normalizedOrigin)) {
//         return callback(null, true);
//       }

//       console.warn("CORS blocked origin:", origin);

//       return callback(new Error("Origin not allowed by CORS"));
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   }),
// );

// // Retain the existing security middleware.
// // Its behavior depends on middleware/security.js.
// app.use(sameOriginOnly(allowedOrigins));

// // =====================================================
// // 3. Request body parsing
// // =====================================================

// app.use(express.json({ limit: "1mb" }));
// app.use(express.urlencoded({ extended: false }));