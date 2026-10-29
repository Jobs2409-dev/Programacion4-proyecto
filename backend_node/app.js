// backend_node/app.js
import 'dotenv/config';
import express from 'express';
import authRoutes from './routes/auth.routes.js';
import categoriaRoutes from './routes/categoria.routes.js';

const app = express();

app.use(express.json());

// Rutas base del módulo Auth
app.use('/api/auth', authRoutes);
app.use('/api/categorias', categoriaRoutes);

export default app;