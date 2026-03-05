const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    UsuarioId: {
        type: String,
        texto: String,
        curtidas: Number,
        comentarios: [
            {
                UsuarioId: String,
                texto: String
            }
        ],
        data: {
            type: Date,
            default: Date.now
        }
    }
});

module.exports = mongoose.model('post', UserSchema);