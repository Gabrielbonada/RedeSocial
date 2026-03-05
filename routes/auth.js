const express = require("express");
const router = express.Router();

//const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//const User = require("./models/User");

const SECRET = "segredo_super_secreto";


// REGISTRO

router.get("/", (req, res) => {
    res.send('lista de usuarios')

});


// LOGIN
router.get("/login", async (req, res) => {

    try {

        const { email, senha } = req.query;

        const usuario = await User.findOne({ email });

        if (!usuario) {
            return res.status(400).json({ erro: "Usuário não encontrado" });
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (!senhaCorreta) {
            return res.status(400).json({ erro: "Senha inválida" });
        }

        const token = jwt.sign(
            { id: usuario._id },
            SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token,
            usuario: {
                id: usuario._id,
                nome: usuario.nome
            }
        });

    } catch (erro) {
        res.status(500).json({ erro: "Erro no servidor" });
    }

});


module.exports = router;