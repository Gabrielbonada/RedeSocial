const express  = require("express");
const router   = express.Router();
const jwt      = require("jsonwebtoken");
const path     = require("path");
const multer   = require("multer");

const Post  = require("../models/post");
const Story = require("../models/story");

const SECRET = "segredo_super_secreto";

// ─── Auth middleware ──────────────────────────────────────────────────────────
function auth(req, res, next) {
    try {
        const token = req.headers.authorization.split(" ")[1];
        req.user = jwt.verify(token, SECRET);
        next();
    } catch {
        res.status(401).json({ erro: "Token inválido" });
    }
}

// ─── Multer: salva uploads de posts ──────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename:    (req, file, cb) => {
        const token   = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, SECRET);
        cb(null, `post_${decoded.id}_${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

// ══════════════════════════════════════════════════════════════
//  POSTS
// ══════════════════════════════════════════════════════════════

// ─── GET /posts/meus  →  lista posts do usuário logado ───────────────────────
router.get("/meus", auth, async (req, res) => {
    try {
        const posts = await Post.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(posts);
    } catch {
        res.status(500).json({ erro: "Erro ao buscar posts" });
    }
});

// ─── POST /posts  →  cria post com imagem ─────────────────────────────────────
router.post("/", auth, upload.single("imagem"), async (req, res) => {
    try {
        const { caption, type } = req.body;
        const src = req.file
            ? `/uploads/${req.file.filename}`
            : req.body.src; // fallback se vier URL externa

        if (!src) return res.status(400).json({ erro: "Imagem obrigatória" });

        const post = await Post.create({
            userId:  req.user.id,
            src,
            caption: caption || "",
            type:    type || "post"
        });

        res.status(201).json(post);
    } catch (e) {
        res.status(500).json({ erro: "Erro ao criar post" });
    }
});

// ─── DELETE /posts/:id  →  exclui post (somente dono) ────────────────────────
router.delete("/:id", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ erro: "Post não encontrado" });
        if (post.userId.toString() !== req.user.id)
            return res.status(403).json({ erro: "Sem permissão" });

        await post.deleteOne();
        res.json({ mensagem: "Post excluído" });
    } catch {
        res.status(500).json({ erro: "Erro ao excluir post" });
    }
});

// ─── POST /posts/:id/like  →  curtir / descurtir ─────────────────────────────
router.post("/:id/like", auth, async (req, res) => {
    try {
        const post    = await Post.findById(req.params.id);
        const userId  = req.user.id;
        const jaCurtiu = post.likedBy.includes(userId);

        if (jaCurtiu) {
            post.likedBy.pull(userId);
            post.likes = Math.max(0, post.likes - 1);
        } else {
            post.likedBy.push(userId);
            post.likes += 1;
        }

        await post.save();
        res.json({ likes: post.likes, curtiu: !jaCurtiu });
    } catch {
        res.status(500).json({ erro: "Erro ao curtir" });
    }
});

// ─── POST /posts/:id/comentarios  →  adiciona comentário ─────────────────────
router.post("/:id/comentarios", auth, async (req, res) => {
    try {
        const { texto } = req.body;
        if (!texto?.trim()) return res.status(400).json({ erro: "Comentário vazio" });

        const post = await Post.findById(req.params.id);
        post.comments.push({ userId: req.user.id, texto });
        await post.save();

        res.json(post.comments);
    } catch {
        res.status(500).json({ erro: "Erro ao comentar" });
    }
});

// ─── DELETE /posts/:id/comentarios/:cid  →  remove comentário ────────────────
router.delete("/:id/comentarios/:cid", auth, async (req, res) => {
    try {
        const post    = await Post.findById(req.params.id);
        const comment = post.comments.id(req.params.cid);

        if (!comment) return res.status(404).json({ erro: "Comentário não encontrado" });

        const ehDono   = post.userId.toString()    === req.user.id;
        const ehAutor  = comment.userId?.toString() === req.user.id;
        if (!ehDono && !ehAutor)
            return res.status(403).json({ erro: "Sem permissão" });

        comment.deleteOne();
        await post.save();
        res.json({ mensagem: "Comentário excluído" });
    } catch {
        res.status(500).json({ erro: "Erro ao excluir comentário" });
    }
});

// ══════════════════════════════════════════════════════════════
//  STORIES
// ══════════════════════════════════════════════════════════════

// ─── GET /posts/stories  →  stories do usuário (últimas 24h) ─────────────────
router.get("/stories", auth, async (req, res) => {
    try {
        const stories = await Story.find({
            userId:    req.user.id,
            expiraEm:  { $gt: new Date() }
        }).sort({ createdAt: -1 });
        res.json(stories);
    } catch {
        res.status(500).json({ erro: "Erro ao buscar stories" });
    }
});

// ─── POST /posts/stories  →  cria story ──────────────────────────────────────
router.post("/stories", auth, upload.single("imagem"), async (req, res) => {
    try {
        const src = req.file ? `/uploads/${req.file.filename}` : req.body.src;
        if (!src) return res.status(400).json({ erro: "Imagem obrigatória" });

        const story = await Story.create({ userId: req.user.id, src });
        res.status(201).json(story);
    } catch {
        res.status(500).json({ erro: "Erro ao criar story" });
    }
});

// ─── DELETE /posts/stories/:id  →  exclui story ──────────────────────────────
router.delete("/stories/:id", auth, async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);
        if (!story) return res.status(404).json({ erro: "Story não encontrado" });
        if (story.userId.toString() !== req.user.id)
            return res.status(403).json({ erro: "Sem permissão" });

        await story.deleteOne();
        res.json({ mensagem: "Story excluído" });
    } catch {
        res.status(500).json({ erro: "Erro ao excluir story" });
    }
});

module.exports = router;