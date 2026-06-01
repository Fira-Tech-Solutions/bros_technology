import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

export function generateToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function authenticate() {
  return async (req, res, next) => {
    try {
      const header = req.headers.authorization;

      if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'Missing or malformed Authorization header',
        });
      }

      const token = header.slice(7);

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Token is empty',
        });
      }

      let decoded;
      try {
        decoded = verifyToken(token);
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ success: false, error: 'Token has expired' });
        }
        return res.status(401).json({ success: false, error: 'Invalid token' });
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
        select: { id: true, email: true, name: true, phone: true, role: true },
      });

      if (!user) {
        return res.status(401).json({ success: false, error: 'User no longer exists' });
      }

      req.user = user;
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Role "${req.user.role}" is not authorized for this resource`,
      });
    }

    next();
  };
}
