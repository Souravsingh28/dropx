// src/middleware/requireRole.js

/**
 * Usage:
 *   requireRole('admin')
 *   requireRole('admin', 'supervisor')
 *   requireRole(['admin','supervisor'])
 */
export default function requireRole(...allowed) {
  const roles = Array.isArray(allowed[0]) ? allowed[0] : allowed;
  return function (req, res, next) {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ error: 'Unauthenticated' });
    if (!roles.includes(role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
}
