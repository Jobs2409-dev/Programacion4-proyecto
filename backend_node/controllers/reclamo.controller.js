// backend_node/controllers/reclamo.controller.js
import { Reclamo } from '../models/Reclamo.js';
import { poolMySQL } from '../config/mysql.js';

// Crear reclamo (Exclusivo para Vecinos / Usuarios autenticados)
export const crearReclamo = async (req, res) => {
    try {
        const { titulo, descripcion, categoria_id, ubicacion } = req.body;

        // Validamos que la categoría exista realmente en MySQL
        const [filas] = await poolMySQL.query('SELECT id FROM reclamos_categoria WHERE id = ?', [categoria_id]);
        if (filas.length === 0) {
            return res.status(404).json({ mensaje: 'La categoría seleccionada no existe en el sistema' });
        }

        const nuevoReclamo = await Reclamo.create({
            titulo,
            descripcion,
            categoria_id,
            usuario_id: req.usuario.id, // ID extraído del token JWT
            ubicacion
        });

        res.status(201).json({
            mensaje: 'Reclamo creado exitosamente',
            reclamo: nuevoReclamo
        });

    } catch (error) {
        console.error('Error al crear reclamo:', error);
        res.status(500).json({ mensaje: 'Error interno al procesar el reclamo', detalle: error.message });
    }
};

// Listar reclamos (Si es VECINO ve solo los suyos; si es OPERADOR o ADMIN ve todos)
export const obtenerReclamos = async (req, res) => {
    try {
        let filtro = {};

        if (req.usuario.rol === 'VECINO') {
            filtro.usuario_id = req.usuario.id;
        }

        const reclamos = await Reclamo.find(filtro)
            .populate('usuario_id', 'email rol')
            .sort({ createdAt: -1 });

        res.status(200).json({
            mensaje: 'Lista de reclamos obtenida',
            total: reclamos.length,
            reclamos
        });

    } catch (error) {
        console.error('Error al obtener reclamos:', error);
        res.status(500).json({ mensaje: 'Error al consultar reclamos', detalle: error.message });
    }
};

// Actualizar estado del reclamo (Exclusivo para OPERADOR o ADMIN)
export const cambiarEstadoReclamo = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const reclamoActualizado = await Reclamo.findByIdAndUpdate(
            id,
            { estado },
            { new: true, runValidators: true }
        );

        if (!reclamoActualizado) {
            return res.status(404).json({ mensaje: 'Reclamo no encontrado' });
        }

        res.status(200).json({
            mensaje: 'Estado del reclamo actualizado',
            reclamo: reclamoActualizado
        });

    } catch (error) {
        console.error('Error al actualizar reclamo:', error);
        res.status(500).json({ mensaje: 'Error al actualizar el reclamo', detalle: error.message });
    }
};