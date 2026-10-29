// backend_node/models/Reclamo.js
import mongoose from 'mongoose';

const reclamoSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: [true, 'El título del reclamo es obligatorio'],
        trim: true
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción es obligatoria'],
        trim: true
    },
    categoria_id: {
        type: Number,
        required: [true, 'La categoría (ID de MySQL) es obligatoria']
    },
    usuario_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    estado: {
        type: String,
        enum: ['PENDIENTE', 'EN_PROCESO', 'RESUELTO', 'RECHAZADO'],
        default: 'PENDIENTE'
    },
    ubicacion: {
        direccion: { type: String, trim: true },
        latitud: { type: Number },
        longitud: { type: Number }
    }
}, {
    timestamps: true
});

export const Reclamo = mongoose.model('Reclamo', reclamoSchema);