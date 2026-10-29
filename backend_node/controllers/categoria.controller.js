// backend_node/controllers/categoria.controller.js
import { poolMySQL } from '../config/mysql.js';

export const obtenerCategorias = async (req, res) => {
    try {
        const [filas] = await poolMySQL.query('SELECT * FROM reclamos_categoria');

        res.status(200).json({
            mensaje: 'Categorías obtenidas correctamente desde MySQL',
            total: filas.length,
            categorias: filas
        });
    } catch (error) {
        console.error('Error al consultar categorías en MySQL:', error);
        res.status(500).json({
            mensaje: 'Error al obtener las categorías desde la base de datos relacional',
            detalle: error.message
        });
    }
};

// Alta de nueva categoría (inserta directamente en MySQL)
export const crearCategoria = async (req, res) => {
    try {
        const { nombre, descripcion, area_id } = req.body;

        const [resultado] = await poolMySQL.query(
            'INSERT INTO reclamos_categoria (nombre, descripcion, area_id) VALUES (?, ?, ?)',
            [nombre, descripcion || null, area_id]
        );

        res.status(201).json({
            mensaje: 'Categoría creada exitosamente en la base de datos relacional',
            categoria: {
                id: resultado.insertId,
                nombre,
                descripcion: descripcion || null,
                area_id
            }
        });

    } catch (error) {
        console.error('Error al crear categoría en MySQL:', error);
        res.status(500).json({
            mensaje: 'Error al crear la categoría en la base de datos relacional',
            detalle: error.message
        });
    }
};