// backend_node/routes/auth.routes.js
import { Router } from 'express';
import { 
    registrasUsuario, 
    crearOperador, 
    login 
} from '../controllers/auth.controller.js';

import { 
    validarRegistro, 
    validarLogin 
} from '../middlewares/validaciones.middleware.js';

import { verificarToken } from '../middlewares/auth.middleware.js';
import { verificarAdmin } from '../middlewares/rol.middleware.js';

const router = Router();

// Registro público (asigna rol VECINO automáticamente)
router.post('/register', validarRegistro, registrasUsuario);

// Registro privado/interno (exclusivo para que un ADMIN cree OPERADORES)
router.post('/crear-operador', verificarToken, verificarAdmin, validarRegistro, crearOperador);

// Login para cualquier rol
router.post('/login', validarLogin, login);

export default router;