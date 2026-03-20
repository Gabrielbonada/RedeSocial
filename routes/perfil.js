const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const SECRET = "segredo_super_secreto"; // use o mesmo do auth.js

// ─── Middleware de autenticação ───────────────────────────────────────────────
function auth(req, res, next) {
    try {
        const token = req.headers.authorization.split(" ")[1];
        req.user = jwt.verify(token, SECRET);
        next();
    } catch {
        res.status(401).json({ erro: "Token inválido" });
    }
}

// ─── PUT /perfil  →  atualiza nome, username, bio, link ──────────────────────
router.put("/", auth, async (req, res) => {
    try {
        const { nome, username, bio, link } = req.body;

        const atualizado = await User.findByIdAndUpdate(
            req.user.id,
            { nome, username, bio, link },
            { new: true }
        ).select("-senha");

        res.json(atualizado);
    } catch {
        res.status(500).json({ erro: "Erro ao atualizar perfil" });
    }
});

// ─── POST /perfil/seguir/:id  →  seguir outro usuário ────────────────────────
router.post("/seguir/:id", auth, async (req, res) => {
    try {
        const alvo = req.params.id;
        const eu   = req.user.id;

        if (alvo === eu) return res.status(400).json({ erro: "Você não pode se seguir" });

        const usuario = await User.findById(eu);
        const jaSegue = usuario.seguindo.includes(alvo);

        if (jaSegue) {
            // deixar de seguir
            await User.findByIdAndUpdate(eu,    { $pull: { seguindo:   alvo } });
            await User.findByIdAndUpdate(alvo,  { $pull: { seguidores: eu   } });
            return res.json({ seguindo: false });
        } else {
            // seguir
            await User.findByIdAndUpdate(eu,    { $addToSet: { seguindo:   alvo } });
            await User.findByIdAndUpdate(alvo,  { $addToSet: { seguidores: eu   } });
            return res.json({ seguindo: true });
        }
    } catch {
        res.status(500).json({ erro: "Erro ao seguir/deixar de seguir" });
    }
});

// ─── GET /perfil/stats  →  retorna contagens do usuário logado ───────────────
router.get("/stats", auth, async (req, res) => {
    try {
        const usuario = await User.findById(req.user.id).select("seguidores seguindo");
        res.json({
            seguidores: usuario.seguidores.length,
            seguindo:   usuario.seguindo.length
        });
    } catch {
        res.status(500).json({ erro: "Erro ao buscar stats" });
    }
});

module.exports = router;