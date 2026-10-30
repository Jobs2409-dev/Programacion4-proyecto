// backend_node/controllers/categoria.controller.js
import { poolMySQL } from '../config/mysql.js';

// Obtener todas las categorías con los datos de su área correspondiente
export const obtenerCategorias = async (req, res) => {
    try {
        const query = `
            SELECT 
                c.id, 
                c.nombre, 
                c.descripcion, 
                c.area_id,
                a.nombre AS area_nombre
            FROM reclamos_categoria c
            LEFT JOIN reclamos_areadependencia a ON c.area_id = a.id
        `;
        const [categorias] = await poolMySQL.query(query);

        res.status(200).json(categorias);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({
            ok: false,
            mensaje: 'Error al consultar las categorías en MySQL',
            error: error.message
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