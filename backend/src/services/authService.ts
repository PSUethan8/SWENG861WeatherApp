import bcrypt from 'bcrypt';
import { User, IUser } from '../models/User.js';
import { createError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

const SALT_ROUNDS = 12;

export interface RegisterInput {
  email: string;
  password: string;
  displayName?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  displayName?: string;
}

export function formatUserResponse(user: IUser): UserResponse {
  return {
    id: user._id.toString(),
    email: user.email,
    displayName: user.displayName,
  };
}

export async function registerUser(input: RegisterInput): Promise<IUser> {
  const { email, password, displayName } = input;
  
  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  
  if (existingUser) {
    throw createError('Email already registered', 409);
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  
  // Create user
  const user = await User.create({
    email: email.toLowerCase(),
    passwordHash,
    displayName: displayName || email.split('@')[0],
  });
  
  logger.info(`New user registered: ${email}`);
  
  return user;
}

