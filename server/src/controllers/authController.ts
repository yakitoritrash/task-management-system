import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { z } from 'zod';

const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

// Validation schemas (using Zod for safety)
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    // 1. Validate input
    const { email, password, name } = registerSchema.parse(req.body);

    // 2. Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    res.status(201).json({ message: 'User created successfully', userId: user.id });
  } catch (error) {
    res.status(400).json({ error: 'Invalid data or server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    // ... validation and user finding logic (same as before) ...
    const { email, password } = req.body; // Simplified for brevity, keep your zod parsing!
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // NEW: Generate both tokens
    const tokens = generateTokens(user.id);

    res.json({ ...tokens, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<any> => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

  try {
    // Verify the refresh token
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET as string) as any;
    
    // Issue a new access token
    const newAccessToken = jwt.sign({ userId: payload.userId }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
    
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
};
