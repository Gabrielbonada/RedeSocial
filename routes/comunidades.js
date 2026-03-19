const express = require("express");
const router = express.Router();

const Community = require("../models/comunidade");
const auth = require("../middleware/authMiddleware.js")


router.post("/:id/entrar", auth, async (req, res) => {
    try {
        await Community.findByIdAndUpdate(req.params.id, {
            $addToSet: { membros: req.userId }
        });

        res.json({ msg: "Entrou" });
    } catch (err) {
        res.status(500).json({ erro: "Erro ao entrar" });
    }
});

router.post("/:id/sair", auth, async (req, res) => {
    try {
        await Community.findByIdAndUpdate(req.params.id, {
            $pull: { membros: req.userId }
        });

        res.json({ msg: "Saiu" });
    } catch (err) {
        res.status(500).json({ erro: "Erro ao sair" });
    }
});
// Importe seu modelo de Post, se ainda não o fez
 const Post = require("../models/post"); // Certifique-se de que o caminho está correto

// Rota para obter os posts de uma comunidade
router.get("/:id/posts", auth, async (req, res) => {
    try {
        const communityId = req.params.id;
        // Supondo que seu modelo Post tenha um campo 'community' ou 'communityId'
        const posts = await Post.find({ community: communityId }).sort({ createdAt: -1 }); // Ordena por mais recente

        res.json(posts);
    } catch (err) {
        console.error("Erro ao buscar posts da comunidade:", err);
        res.status(500).json({ erro: "Erro ao buscar posts da comunidade" });
    }
});


// Rota para obter detalhes de uma comunidade específica
router.get("/:id", auth, async (req, res) => {
    try {
        const communityId = req.params.id;
        const userId = req.userId;

        const community = await Community.findById(communityId);

        if (!community) {
            return res.status(404).json({ erro: "Comunidade não encontrada" });
        }

        // Adiciona a informação se o usuário participa ou não
        const resultado = {
            ...community._doc,
            participa: community.membros.includes(userId)
        };

        res.json(resultado);
    } catch (err) {
        console.error("Erro ao buscar detalhes da comunidade:", err);
        res.status(500).json({ erro: "Erro ao buscar detalhes da comunidade" });
    }
});



// criar comunidade
router.post("/create", async (req, res) => {

    try {

        const community = new Community(req.body);

        await community.save();

        res.json(community);

    } catch (err) {

        res.status(500).json({ error: err.message });

    }

});

/*
// Nova rota para listar comunidades que o usuário participa
router.get("/minhas", auth, async (req, res) => {
    try {
        const userId = req.userId;
        const minhasComunidades = await Community.find({ membros: userId });
        res.json(minhasComunidades);
    } catch (err) {
        console.error("Erro ao buscar comunidades do usuário:", err);
        res.status(500).json({ erro: "Erro ao buscar suas comunidades" });
    }
});
*/

// listar comunidades
router.get("/", auth, async (req, res) => {

    const userId = req.userId

    const comunidades = await Community.find()

    const resultado = comunidades.map(c => ({
        ...c._doc,
        participa: c.membros.some(m => m.toString() === userId)
    }))

    res.json(resultado)

});



router.get("/recomendadas", auth, async (req, res) => {

    try {

        const userId = req.userId

        // 1. pegar comunidades que o usuário participa
        const minhas = await Community.find({
            membros: userId
        })

        // 2. pegar tags dessas comunidades
        let tagsUsuario = []

        minhas.forEach(c => {
            tagsUsuario = tagsUsuario.concat(c.tags)
        })

        // remover duplicadas
        tagsUsuario = [...new Set(tagsUsuario)]

        if (tagsUsuario.length === 0) {
            const todas = await Community.find().limit(10)
            return res.json(todas)
        }

        // 3. buscar comunidades parecidas
        const recomendadas = await Community.aggregate([

           
            {
                $match: {
                     membros: { $not: { $in: [userId] } }
                }
            },


            {
                $addFields: {
                    matchTags: {
                        $size: {
                            $setIntersection: ["$tags", tagsUsuario]
                        }
                    }
                }
            },


            {
                $match: {
                    matchTags: { $gt: 0 }
                }
            },


            {
                $sort: { matchTags: -1 }
            },


            {
                $limit: 10
            }

        ])
        res.json(recomendadas)



    } catch (err) {

        res.status(500).json({ erro: "Erro ao buscar recomendadas" })

    }

})


module.exports = router;