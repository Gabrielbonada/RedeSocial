const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        String,
        required: true,
        unique: true
    },
    senha: {
        String,
        unique: true,
        required: true
    },
    foto: {
        String,
        required: false
    },
    bio: {
        String,
        required:false
    },
    seguidores: [String]
});

models.exports = moongoose.model('user', UserSchema);