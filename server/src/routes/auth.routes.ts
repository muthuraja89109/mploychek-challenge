import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { ROLES, User, toPublicUser } from '../models/User';
import { delay } from '../middleware/delay';

export const authRouter = Router();

// POST /api/auth/login   body: { userId, password, role }
authRouter.post('/login', delay, async (req, res) => {
  const { userId, password, role } = req.body ?? {};

  if (!userId || !password || !ROLES.includes(role)) {
    return res.status(400).json({ message: 'Enter your user ID, password and role.' });
  }

  const user = await User.findOne({ userId: String(userId).toLowerCase().trim() });
  const passwordOk = user ? await bcrypt.compare(password, user.passwordHash) : false;

  // Same message for "no such user" and "wrong password" so attackers learn nothing.
  if (!user || !passwordOk) {
    return res.status(401).json({ message: 'User ID or password is incorrect.' });
  }
  // The role chosen on the form must match the role stored in the DB.
  if (user.role !== role) {
    return res.status(403).json({ message: `This account is not registered as ${role}.` });
  }

  const token = jwt.sign({ sub: String(user._id), role: user.role }, config.jwtSecret, {
    expiresIn: '8h',
  });
  res.json({ token, user: toPublicUser(user) });
});
