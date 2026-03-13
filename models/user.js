const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({

    nome: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    senha: {
        type: String,
        required: true
    },

    foto: String,

    bio: String,

    seguidores: [String]

});

module.exports = mongoose.model("User", UserSchema);