const mongoose = require("mongoose");

// ⚠️  Substitua seu models/user.js por este arquivo
const UserSchema = new mongoose.Schema({

    nome: {
        type: String,
        required: true
    },

    username: {
        type: String,
        default: ""
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

    foto: {
        type: String,
        default: ""
    },

    bio: {
        type: String,
        default: ""
    },

    link: {
        type: String,
        default: ""
    },

    seguidores: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    seguindo:   [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]

}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);