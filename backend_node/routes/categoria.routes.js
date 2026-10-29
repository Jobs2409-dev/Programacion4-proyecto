// backend_node/routes/categoria.routes.js
import { Router } from 'express';
import { obtenerCategorias, crearCategoria } from '../controllers/categoria.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';
import { verificarAdmin } from '../middlewares/rol.middleware.js';
import { validarCategoria } from '../middlewares/validaciones.middleware.js';

const router = Router();

// Consultar categorías
router.get('/', verificarToken, obtenerCategorias);

// Crear categoría (ADMIN)
router.post('/', verificarToken, verificarAdmin, validarCategoria, crearCategoria);

export default router;