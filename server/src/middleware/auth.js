import jwt from 'jsonwebtoken';
export function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Missing Authorization header' });
  const token = header.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, id_number, role }
    next();
  } catch (e) { return res.status(401).json({ error: 'Invalid or expired token' }); }
}
