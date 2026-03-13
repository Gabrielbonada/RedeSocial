const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({

    usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    texto: String,

    curtidas: [String],

    comentarios: [
        {
            usuario: String,
            texto: String
        }
    ],

    data: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Post", PostSchema);