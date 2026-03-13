const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const SECRET = "segredo_super_secreto";

router.post("/register", async (req, res) => {

    try {

        const { nome, email, senha } = req.body;

        const senhaHash = await bcrypt.hash(senha, 10);

        const novoUsuario = new User({
            nome,
            email,
            senha: senhaHash
        });

        await novoUsuario.save();

        res.json({ mensagem: "Usuário registrado com sucesso!" });

    } catch (erro) {

        res.status(500).json({ erro: "Erro ao registrar" });

    }

});

router.post("/login", async (req, res) => {

    try {

        const { email, senha } = req.body;

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

        res.json({ token });

    } catch (erro) {

        res.status(500).json({ erro: "Erro no servidor" });

    }

});
router.get("/me", async (req, res) => {

try{

const token = req.headers.authorization.split(" ")[1]

const decoded = jwt.verify(token, SECRET)

const usuario = await User.findById(decoded.id).select("-senha")

res.json(usuario)

}catch{

res.status(401).json({erro:"Token inválido"})

}

})

module.exports = router;