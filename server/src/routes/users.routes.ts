import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { ROLES, User, toPublicUser } from '../models/User';
import { delay } from '../middleware/delay';
import { requireAdmin, requireAuth } from '../middleware/auth';

export const usersRouter = Router();

// Every route below needs a logged-in user, and honours ?delay=
usersRouter.use(requireAuth, delay);

// GET /api/users/me  -> details of the logged-in user (any role)
usersRouter.get('/me', async (req, res) => {
  const user = await User.findById(req.auth!.sub);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json(toPublicUser(user));
});

// ---- Admin only from here ----
usersRouter.use(requireAdmin);

// GET /api/users
usersRouter.get('/', async (_req, res) => {
  const users = await User.find().sort({ createdAt: 1 });
  res.json(users.map(toPublicUser));
});

// POST /api/users   body: { userId, name, email, department, role, password }
usersRouter.post('/', async (req, res) => {
  const { userId, name, email, department, role, password } = req.body ?? {};
  if (!userId || !name || !email || !password || !ROLES.includes(role)) {
    return res.status(400).json({ message: 'User ID, name, email, role and password are required.' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }
  const exists = await User.exists({ userId: String(userId).toLowerCase().trim() });
  if (exists) return res.status(409).json({ message: `User ID "${userId}" is already taken.` });

  const user = await User.create({
    userId,
    name,
    email,
    department,
    role,
    passwordHash: await bcrypt.hash(password, 10),
  });
  res.status(201).json(toPublicUser(user));
});

// PUT /api/users/:id   body: any of { name, email, department, role, password }
usersRouter.put('/:id', async (req, res) => {
  const { name, email, department, role, password } = req.body ?? {};
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  if (role !== undefined) {
    if (!ROLES.includes(role)) return res.status(400).json({ message: 'Unknown role.' });
    // Stop an admin from locking themselves out
    if (String(user._id) === req.auth!.sub && role !== 'Admin') {
      return res.status(400).json({ message: 'You cannot remove your own admin role.' });
    }
    user.role = role;
  }
  if (name) user.name = name;
  if (email) user.email = email;
  if (department !== undefined) user.department = department;
  if (password) {
    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
    user.passwordHash = await bcrypt.hash(password, 10);
  }
  await user.save();
  res.json(toPublicUser(user));
});

// DELETE /api/users/:id
usersRouter.delete('/:id', async (req, res) => {
  if (req.params.id === req.auth!.sub) {
    return res.status(400).json({ message: 'You cannot delete your own account.' });
  }
  const deleted = await User.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'User not found.' });
  res.status(204).end();
});
