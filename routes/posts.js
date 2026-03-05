const express = require("express");
const router = express.Router();

const Post = require("./models/Post");
const authMiddleware = require("../middleware/authMiddleware");


// CRIAR POST
router.post("/post", authMiddleware, async (req, res) => {

    try {

        const { texto } = req.body;

        const novoPost = new Post({
            usuarioId: req.userId,
            texto
        });

        await novoPost.save();

        res.json(novoPost);

    } catch (erro) {
        res.status(500).json({ erro: "Erro ao criar post" });
    }

});


// PEGAR FEED
router.get("/feed", async (req, res) => {

    try {

        const posts = await Post.find().sort({ data: -1 });

        res.json(posts);

    } catch (erro) {
        res.status(500).json({ erro: "Erro ao buscar feed" });
    }

});


// CURTIR POST
router.post("/curtir/:id", authMiddleware, async (req, res) => {

    try {

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ erro: "Post não encontrado" });
        }

        if (post.curtidas.includes(req.userId)) {

            post.curtidas = post.curtidas.filter(
                id => id !== req.userId
            );

        } else {

            post.curtidas.push(req.userId);

        }

        await post.save();

        res.json(post);

    } catch (erro) {
        res.status(500).json({ erro: "Erro ao curtir post" });
    }

});


// COMENTAR
router.post("/comentar/:id", authMiddleware, async (req, res) => {

    try {

        const { texto } = req.body;

        const post = await Post.findById(req.params.id);

        post.comentarios.push({
            usuario: req.userId,
            texto
        });

        await post.save();

        res.json(post);

    } catch (erro) {
        res.status(500).json({ erro: "Erro ao comentar" });
    }

});

module.exports = router;