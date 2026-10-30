// backend_node/controllers/area.controller.js
import { poolMySQL } from '../config/mysql.js';

// Obtener todas las áreas de dependencia desde MySQL
export const obtenerAreas = async (req, res) => {
    try {
        const [areas] = await poolMySQL.query('SELECT * FROM reclamos_areadependencia');
        res.status(200).json({
            ok: true,
            total: areas.length,
            areas
        });
    } catch (error) {
        console.error('Error al obtener áreas:', error);
        res.status(500).json({
            ok: false,
            mensaje: 'Error al consultar las áreas de dependencia en MySQL',
            error: error.message
        });
    }
};