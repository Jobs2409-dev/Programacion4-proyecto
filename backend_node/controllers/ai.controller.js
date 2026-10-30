// backend_node/controllers/ai.controller.js
import { analizarReclamoConIA } from '../services/ai.service.js';

export const sugerirAnalisis = async (req, res) => {
    try {
        const { descripcion } = req.body;

        if (!descripcion) {
            return res.status(400).json({ mensaje: 'La descripción es obligatoria' });
        }

        const resultado = await analizarReclamoConIA(descripcion);

        res.status(200).json({
            ok: true,
            analisis: resultado
        });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al procesar con IA', detalle: error.message });
    }
};