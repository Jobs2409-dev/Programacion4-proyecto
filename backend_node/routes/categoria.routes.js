// backend_node/routes/categoria.routes.js
import { Router } from 'express';
import { obtenerCategorias, crearCategoria } from '../controllers/categoria.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';
import { verificarAdmin } from '../middlewares/rol.middleware.js';
import { validarCategoria } from '../middlewares/validaciones.middleware.js';
import { obtenerAreas } from '../controllers/area.controller.js';

const router = Router();

// La lectura del catálogo es pública; su modificación requiere rol ADMIN.
router.get('/', obtenerCategorias);
router.get('/areas', obtenerAreas);

// Crear categoría (ADMIN)
router.post('/', verificarToken, verificarAdmin, validarCategoria, crearCategoria);

export default router;