import mongoose from 'mongoose';

const registroHistorialSchema = new mongoose.Schema({
    estado: {
        type: String,
        enum: ['PENDIENTE', 'EN_PROCESO', 'RESUELTO', 'RECHAZADO'],
        required: true
    },
    usuario_operador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    observacion: {
        type: String,
        default: ''
    },
    fecha: {
        type: Date,
        default: Date.now
    }
});

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
    estado_actual: {
        type: String,
        enum: ['PENDIENTE', 'EN_PROCESO', 'RESUELTO', 'RECHAZADO'],
        default: 'PENDIENTE'
    },
    ubicacion: {
        direccion: { type: String, trim: true },
        latitud: { type: Number },
        longitud: { type: Number }
    },
    historial: [registroHistorialSchema]
}, {
    timestamps: true
});

export const Reclamo = mongoose.model('Reclamo', reclamoSchema);