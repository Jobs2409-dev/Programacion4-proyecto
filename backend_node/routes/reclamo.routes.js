// backend_node/routes/reclamo.routes.js
import { Router } from 'express';
import { 
    crearReclamo, 
    obtenerReclamos, 
    cambiarEstadoReclamo 
} from '../controllers/reclamo.controller.js';

import { verificarToken } from '../middlewares/auth.middleware.js';
import { verificarOperadorOAdmin } from '../middlewares/rol.middleware.js';
import { 
    validarCrearReclamo, 
    validarCambioEstado 
} from '../middlewares/validaciones.middleware.js';

const router = Router();

// Todas las rutas requieren estar autenticado
router.use(verificarToken);

// Crear y listar reclamos
router.post('/', validarCrearReclamo, crearReclamo);
router.get('/', obtenerReclamos);

// Cambiar estado (Solo para Operadores o Admins)
router.patch('/:id/estado', verificarOperadorOAdmin, validarCambioEstado, cambiarEstadoReclamo);

export default router;