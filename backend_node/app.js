// backend_node/app.js
import 'dotenv/config';
import express from 'express';
import authRoutes from './routes/auth.routes.js';
import categoriaRoutes from './routes/categoria.routes.js';
import reclamoRoutes from './routes/reclamo.routes.js';
import aiRoutes from './routes/ai.routes.js';

const app = express();

app.use(express.json());

// Rutas del sistema
app.use('/api/auth', authRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/reclamos', reclamoRoutes);
app.use('/api/ai', aiRoutes);


export default app;