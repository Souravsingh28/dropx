import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/users.routes.js';
import employeeRoutes from './routes/employees.routes.js';
import lotRoutes from './routes/lots.routes.js';
import productionRoutes from './routes/production.routes.js';
import payrollRoutes from './routes/payroll.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import workerRoutes from './routes/worker.routes.js';
import meRoutes from './routes/me.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve uploaded files (ONE mount)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ✅ API routes
app.get('/api/health', (_req, res) => res.json({ ok: true, app: 'DropX API' }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/lots', lotRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/worker', workerRoutes);
app.use('/api/me', meRoutes);

// ✅ Serve the React build (adjust path if your structure differs)
const clientDist = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDist));

// ✅ SPA fallback for non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(clientDist, 'index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API running on :${port}`));
