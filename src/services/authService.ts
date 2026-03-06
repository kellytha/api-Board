import { PrismaClient } from '@prisma/client';
import { PasswordService } from '../utils/password.js';
import { TokenService } from '../utils/token.js';
import { IAuthResponse, UserResponse } from '../types/index.js';
import { ConflictError, UnauthorizedError } from '../utils/errors.js';

const prisma = new PrismaClient();

export class AuthService {
  /**
   * Register a new user
   */
  static async register(email: string, username: string, password: string): Promise<IAuthResponse> {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      throw new ConflictError('Email or username already exists');
    }

    // Hash password
    const hashedPassword = await PasswordService.hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });

    // Generate token
    const token = TokenService.generateToken({
      userId: user.id,
      email: user.email,
    });

    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      token,
      user: userResponse,
    };
  }

  /**
   * Login user
   */
  static async login(email: string, password: string): Promise<IAuthResponse> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await PasswordService.comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate token
    const token = TokenService.generateToken({
      userId: user.id,
      email: user.email,
    });

    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      token,
      user: userResponse,
    };
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return userResponse;
  }
}
