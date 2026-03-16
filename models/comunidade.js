const mongoose = require("mongoose");

const Communitychema = new mongoose.Schema({
 nome: {
        type: String,
        required: true
    },

    descricao: {
        type: String
    },

    imagem: {
        type: String
    },

    criador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    membros: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    dataCriacao: {
        type: Date,
        default: Date.now
    }


});

module.exports = mongoose.model("comunidades", Communitychema);