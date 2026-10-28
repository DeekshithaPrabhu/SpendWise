import { NextFunction, Request, Response } from 'express';

export function notFound(req: Request, res: Response) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  if (err.code === 11000) return res.status(409).json({ message: 'Already exists' });
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  if (err.message === 'Origin not allowed by CORS') {
    return res.status(403).json({ message: 'Origin not allowed' });
  }
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
}
