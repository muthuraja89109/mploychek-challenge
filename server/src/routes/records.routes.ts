import { Router } from 'express';
import { VerificationRecord } from '../models/Record';
import { delay } from '../middleware/delay';
import { requireAuth } from '../middleware/auth';

export const recordsRouter = Router();

const CLEARANCE = { 'General User': 1, Admin: 3 } as const;

// GET /api/records?delay=3000
// Returns only the records the caller is cleared to see, plus how many are hidden.
recordsRouter.get('/', requireAuth, delay, async (req, res) => {
  const clearance = CLEARANCE[req.auth!.role];
  const [records, total] = await Promise.all([
    VerificationRecord.find({ accessLevel: { $lte: clearance } }).sort({ updatedOn: -1 }),
    VerificationRecord.countDocuments(),
  ]);
  res.json({
    clearance,
    total,
    hidden: total - records.length,
    records: records.map((r) => ({
      id: String(r._id),
      reference: r.reference,
      candidate: r.candidate,
      check: r.check,
      status: r.status,
      accessLevel: r.accessLevel,
      updatedOn: r.updatedOn,
    })),
  });
});
