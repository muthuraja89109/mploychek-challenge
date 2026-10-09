import { RequestHandler } from 'express';

const MAX_DELAY_MS = 10_000;

/**
 * Simulated slow API.
 * Call any route with "?delay=3000" and the response waits 3 seconds.
 * This lets the Angular app prove it handles async loading properly.
 */
export const delay: RequestHandler = (req, _res, next) => {
  const ms = Math.min(Math.max(Number(req.query.delay) || 0, 0), MAX_DELAY_MS);
  if (ms === 0) return next();
  setTimeout(next, ms);
};
