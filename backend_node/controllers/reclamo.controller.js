// backend_node/controllers/reclamo.controller.js
import { Reclamo } from '../models/Reclamo.js';
import { poolMySQL } from '../config/mysql.js';

// Crear reclamo (Exclusivo para Vecinos / Usuarios autenticados)
export const crearReclamo = async (req, res) => {
    try {
        const { titulo, descripcion, categoria_id, ubicacion } = req.body;

        const [filas] = await poolMySQL.query('SELECT id FROM reclamos_categoria WHERE id = ?', [categoria_id]);
        if (filas.length === 0) {
            return res.status(404).json({ mensaje: 'La categoría seleccionada no existe en el sistema' });
        }

        const nuevoReclamo = await Reclamo.create({
            titulo,
            descripcion,
            categoria_id,
            usuario_id: req.usuario.id,
            ubicacion: ubicacion || {},
            estado_actual: 'PENDIENTE',
            historial: [{
                estado: 'PENDIENTE',
                usuario_operador: req.usuario.id,
                observacion: 'Reclamo creado por el ciudadano'
            }]
        });

        // Emitir alerta en tiempo real a los operadores conectados
        const io = req.app.get('io');
        if (io) {
            io.emit('nuevo_reclamo', {
                mensaje: 'Se ha registrado un nuevo reclamo ciudadano',
                reclamo: nuevoReclamo
            });
        }

        res.status(201).json({
            mensaje: 'Reclamo creado exitosamente',
            reclamo: nuevoReclamo
        });

    } catch (error) {
        console.error('Error al crear reclamo:', error);
        res.status(500).json({ mensaje: 'Error interno al procesar el reclamo', detalle: error.message });
    }
};

// Listar reclamos
export const obtenerReclamos = async (req, res) => {
    try {
        let filtro = {};

        if (req.usuario.rol === 'VECINO') {
            filtro.usuario_id = req.usuario.id;
        }

        const reclamos = await Reclamo.find(filtro)
            .populate('usuario_id', 'email rol nombre apellido')
            .populate('historial.usuario_operador', 'email rol nombre apellido')
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

// Actualizar estado del reclamo
export const cambiarEstadoReclamo = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, observacion } = req.body;

        const reclamo = await Reclamo.findById(id);
        if (!reclamo) {
            return res.status(404).json({ mensaje: 'Reclamo no encontrado' });
        }

        reclamo.estado_actual = estado;

        reclamo.historial.push({
            estado,
            usuario_operador: req.usuario.id,
            observacion: observacion || `Estado actualizado a ${estado}`
        });

        await reclamo.save();

        res.status(200).json({
            mensaje: 'Estado del reclamo actualizado exitosamente',
            reclamo
        });

    } catch (error) {
        console.error('Error al actualizar reclamo:', error);
        res.status(500).json({ mensaje: 'Error al actualizar el reclamo', detalle: error.message });
    }
};