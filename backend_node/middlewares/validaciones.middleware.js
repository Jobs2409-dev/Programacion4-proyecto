// backend_node/middlewares/validaciones.middleware.js

/* Acá se define las reglas para los endpoints de Auth (registro y login)*/
import { body } from 'express-validator';
import { validarCampos } from './validarCampos.middleware.js';

export const validarRegistro = [
    body('email')
        .isEmail().withMessage('El correo debe ser un email válido'),
    body('password')
        .isLength({ min: 4 }).withMessage('La contraseña debe tener al menos 4 caracteres'),
    body('rol')
        .optional()
        .isIn(['VECINO', 'OPERADOR', 'ADMIN']).withMessage('El rol debe ser VECINO, OPERADOR o ADMIN'),
    validarCampos
];

export const validarLogin = [
    body('email')
        .isEmail().withMessage('Credenciales incompletas o formato inválido'),
    body('password')
        .notEmpty().withMessage('Credenciales incompletas o formato inválido'),
    validarCampos
];

export const validarCategoria = [
    body('nombre')
        .notEmpty().withMessage('El nombre de la categoría es obligatorio')
        .isString().withMessage('El nombre debe ser un texto'),
    body('area_id')
        .notEmpty().withMessage('El area_id es obligatorio')
        .isInt().withMessage('El area_id debe ser un número entero'),
    body('descripcion')
        .optional()
        .isString().withMessage('La descripción debe ser un texto'),
    validarCampos
];