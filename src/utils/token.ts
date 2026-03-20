import jwt, { Secret } from 'jsonwebtoken';
import { IJWTPayload } from '../types/index.js';

const JWT_SECRET: Secret = (process.env.JWT_SECRET ?? 'default_secret') as Secret;
const JWT_EXPIRATION: string = process.env.JWT_EXPIRATION || '7d';

export class TokenService {
  /**
   * Generate a JWT token for a user
   */
  static generateToken(payload: IJWTPayload): string {
    return jwt.sign(payload, JWT_SECRET as Secret, {
      expiresIn: JWT_EXPIRATION,
    });
  }

  /**
   * Verify and decode a JWT token
   */
  static verifyToken(token: string): IJWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as IJWTPayload;
    } catch (err) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }
}