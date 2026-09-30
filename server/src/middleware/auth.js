import { verifyAccessToken } from '../utils/jwt.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Please sign in to continue.', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      throw new AppError('Your session has expired. Please sign in again.', 401, 'TOKEN_EXPIRED');
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new AppError('Account not found. Please register or sign in again.', 401, 'USER_NOT_FOUND');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
