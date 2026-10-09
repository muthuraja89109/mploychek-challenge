import { Schema, model } from 'mongoose';

/**
 * Access levels:
 *   1 = public        -> everyone can see it
 *   2 = restricted    -> Admins only
 *   3 = confidential  -> Admins only
 * A "General User" has clearance level 1, an "Admin" has level 3.
 */
const recordSchema = new Schema(
  {
    reference: { type: String, required: true, unique: true },
    candidate: { type: String, required: true },
    check: { type: String, required: true }, // e.g. "Education", "Criminal"
    status: { type: String, enum: ['Verified', 'In progress', 'Flagged'], required: true },
    accessLevel: { type: Number, enum: [1, 2, 3], required: true },
    updatedOn: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const VerificationRecord = model('VerificationRecord', recordSchema);
