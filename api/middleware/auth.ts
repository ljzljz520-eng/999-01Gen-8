import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { UserRole, User } from '../../shared/types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'uniform-order-secret-key-2024';

export interface AuthRequest extends Request {
  user?: User;
}

export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name, phone: user.phone },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authMiddleware(requiredRoles?: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未提供认证令牌' });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as User;
      
      if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(decoded.role)) {
        return res.status(403).json({ error: '权限不足' });
      }

      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: '认证令牌无效或已过期' });
    }
  };
}
