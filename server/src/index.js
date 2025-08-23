import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';

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

// ✅ Serve uploaded files (only once)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API routes
app.get('/', (_req, res) => res.json({ ok: true, app: 'DropX API' }));
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

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API running on :${port}`));
