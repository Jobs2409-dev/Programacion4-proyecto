// backend_node/models/Usuario.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const usuarioSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    rol: {
        type: String,
        enum: ['VECINO', 'OPERADOR', 'ADMIN'],
        default: 'VECINO'
    }
}, {
    timestamps: true
});

// Hashea la contraseña automáticamente antes de guardar si cambió
usuarioSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar contraseña ingresada con la hasheada
usuarioSchema.methods.comparePassword = async function (passwordIngresado) {
    return await bcrypt.compare(passwordIngresado, this.password);
};

export const Usuario = mongoose.model('Usuario', usuarioSchema);