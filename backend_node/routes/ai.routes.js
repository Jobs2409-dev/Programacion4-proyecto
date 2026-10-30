// backend_node/routes/ai.routes.js
import { Router } from 'express';
import { sugerirAnalisis } from '../controllers/ai.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Endpoint protegido
router.post('/analizar', verificarToken, sugerirAnalisis);

export default router;