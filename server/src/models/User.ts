import { Schema, model, InferSchemaType } from 'mongoose';

export const ROLES = ['General User', 'Admin'] as const;
export type Role = (typeof ROLES)[number];

/**
 * A Mongoose schema describes the shape of documents in a MongoDB collection.
 * "userId" is what people type on the login page (e.g. "admin"),
 * which is separate from MongoDB's own "_id".
 */
const userSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    department: { type: String, default: 'Operations', trim: true },
    role: { type: String, enum: ROLES, required: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true } // adds createdAt / updatedAt automatically
);

export type UserDoc = InferSchemaType<typeof userSchema>;
export const User = model('User', userSchema);

/** Strip the password hash before sending a user to the browser. */
export function toPublicUser(u: any) {
  return {
    id: String(u._id),
    userId: u.userId,
    name: u.name,
    email: u.email,
    department: u.department,
    role: u.role as Role,
    createdAt: u.createdAt,
  };
}
