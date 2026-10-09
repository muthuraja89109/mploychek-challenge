import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { config } from './config';
import { User } from './models/User';
import { VerificationRecord } from './models/Record';

/** Fills an empty database with demo users and records. Safe to call repeatedly. */
export async function seedIfEmpty() {
  if ((await User.countDocuments()) === 0) {
    await User.insertMany([
      {
        userId: 'admin',
        name: 'Anitha Raman',
        email: 'anitha@mploychek.example',
        department: 'Compliance',
        role: 'Admin',
        passwordHash: await bcrypt.hash('admin123', 10),
      },
      {
        userId: 'user',
        name: 'Karthik Subramani',
        email: 'karthik@mploychek.example',
        department: 'Operations',
        role: 'General User',
        passwordHash: await bcrypt.hash('user123', 10),
      },
    ]);
    console.log('Seeded users: admin/admin123 and user/user123');
  }

  if ((await VerificationRecord.countDocuments()) === 0) {
    const day = 86_400_000;
    const now = Date.now();
    const rows: [string, string, string, 'Verified' | 'In progress' | 'Flagged', 1 | 2 | 3][] = [
      ['VR-1001', 'Priya Natarajan', 'Education', 'Verified', 1],
      ['VR-1002', 'Arun Venkatesh', 'Employment history', 'In progress', 1],
      ['VR-1003', 'Meena Krishnan', 'Address', 'Verified', 1],
      ['VR-1004', 'Rahul Dev', 'Identity (Aadhaar)', 'Verified', 1],
      ['VR-1005', 'Sneha Iyer', 'Education', 'In progress', 1],
      ['VR-2001', 'Vikram Sethu', 'Criminal record', 'Flagged', 2],
      ['VR-2002', 'Deepa Lakshmi', 'Credit history', 'Verified', 2],
      ['VR-2003', 'Naveen Kumar', 'Employment history', 'Flagged', 2],
      ['VR-3001', 'Harini Balaji', 'Court records', 'In progress', 3],
      ['VR-3002', 'Suresh Pandian', 'Global sanctions', 'Verified', 3],
      ['VR-3003', 'Janani Murugan', 'Criminal record', 'Flagged', 3],
    ];
    await VerificationRecord.insertMany(
      rows.map(([reference, candidate, check, status, accessLevel], i) => ({
        reference,
        candidate,
        check,
        status,
        accessLevel,
        updatedOn: new Date(now - i * day * 1.7),
      }))
    );
    console.log(`Seeded ${rows.length} verification records`);
  }
}

// Allow "npm run seed" to run this file directly
if (require.main === module) {
  mongoose
    .connect(config.mongoUri)
    .then(seedIfEmpty)
    .then(() => mongoose.disconnect());
}
