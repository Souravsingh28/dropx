// Turns "/uploads/abc.jpg" into "http://localhost:5000/uploads/abc.jpg"
// If it's already an absolute URL, returns it unchanged.
export function imgUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const base = import.meta.env.VITE_API_URL || '';
  return `${base}${path}`;
}

// Optional: initials placeholder if no image
export function initials(name = '') {
  const parts = String(name).trim().split(/\s+/);
  const i1 = parts[0]?.[0] || '';
  const i2 = parts[1]?.[0] || '';
  return (i1 + i2).toUpperCase() || 'U';
}
