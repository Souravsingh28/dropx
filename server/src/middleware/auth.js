// src/middleware/auth.js
import jwt from 'jsonwebtoken';

/**
 * Verifies "Authorization: Bearer <token>" and attaches payload to req.user
 * Your login should sign with the same secret.
 */
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export default function requireAuth(req, res, next) {
  try {
    const hdr = req.headers['authorization'] || '';
    const m = hdr.match(/^Bearer\s+(.+)$/i);
    if (!m) return res.status(401).json({ error: 'Missing Authorization header' });

    const token = m[1];
    const payload = jwt.verify(token, JWT_SECRET);
    // expected at least { id, role }
    if (!payload || !payload.id || !payload.role) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
