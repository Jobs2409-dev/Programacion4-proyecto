// backend_node/tests/reclamos.test.js
import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { Usuario } from '../models/Usuario.js';
import { conectarDB } from '../config/db.js';

const mockAnalizarReclamoConIA = jest.fn();
jest.unstable_mockModule('../services/ai.service.js', () => ({
    analizarReclamoConIA: mockAnalizarReclamoConIA
}));

const { default: app } = await import('../app.js');

// Aumentamos el timeout global de Jest a 30 segundos
jest.setTimeout(30000);

describe('Suite de Pruebas de Integración - VozVecinal API', () => {

    let tokenVecino = '';
    let usuarioTestId = '';

    const testUser = {
        nombre: "Test",
        apellido: "Runner",
        email: `test_${Date.now()}@test.com`,
        password: "password123",
        dni: `${Math.floor(10000000 + Math.random() * 90000000)}`,
        telefono: "3777000000"
    };

    beforeAll(async () => {
        // 1. Asegurar la conexión a la base de datos
        await conectarDB();

        // 2. Registrar usuario de prueba
        const regRes = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        if (regRes.body.usuario) {
            usuarioTestId = regRes.body.usuario.id;
        }

        // 3. Login para obtener JWT
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });

        tokenVecino = loginRes.body.token;
    });

    afterAll(async () => {
        // Limpieza del usuario y cierre de sockets/DB
        if (usuarioTestId) {
            await Usuario.findByIdAndDelete(usuarioTestId);
        }
        await mongoose.connection.close();
    });

    test('GET /api/categorias - Debería retornar listado de categorías', async () => {
        const res = await request(app).get('/api/categorias');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('POST /api/reclamos - Debería rechazar creación sin token (401)', async () => {
        const res = await request(app)
            .post('/api/reclamos')
            .send({
                titulo: 'Sin Token',
                descripcion: 'Prueba de rechazo',
                categoria_id: 1
            });

        expect(res.statusCode).toBe(401);
    });

    test('POST /api/reclamos - Debería crear un reclamo exitosamente', async () => {
        const res = await request(app)
            .post('/api/reclamos')
            .set('Authorization', `Bearer ${tokenVecino}`)
            .send({
                titulo: 'Prueba con Supertest',
                descripcion: 'Evaluación automatizada de integración',
                categoria_id: 1
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.reclamo).toHaveProperty('_id');
        expect(res.body.reclamo.estado_actual).toBe('PENDIENTE');
    });

    test('POST /api/ai/analizar - Debería devolver análisis de urgencia con IA', async () => {
        mockAnalizarReclamoConIA.mockResolvedValueOnce({
            prioridad: 'ALTA',
            resumen: 'Cables caídos con riesgo en vía pública'
        });

        const res = await request(app)
            .post('/api/ai/analizar')
            .set('Authorization', `Bearer ${tokenVecino}`)
            .send({
                descripcion: 'Cables caídos en la vía pública echando chispas'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.analisis).toHaveProperty('prioridad');
        expect(res.body.analisis).toHaveProperty('resumen');
    });

    test('POST /api/ai/analizar - Debería informar errores del proveedor', async () => {
        mockAnalizarReclamoConIA.mockRejectedValueOnce(new Error('Proveedor no disponible'));

        const res = await request(app)
            .post('/api/ai/analizar')
            .set('Authorization', `Bearer ${tokenVecino}`)
            .send({
                descripcion: 'Reclamo de prueba'
            });

        expect(res.statusCode).toBe(500);
        expect(res.body.detalle).toBe('Proveedor no disponible');
    });
});