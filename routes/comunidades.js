const express = require("express");
const router = express.Router();

const Community = require("../models/comunidade");
const auth = require("../middleware/auth")


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


// listar comunidades
router.get("/", auth, async (req, res) => {

    const userId = req.userId

    const comunidades = await Community.find()

    const resultado = comunidades.map(c => ({
        ...c._doc,
        participa: c.membros.includes(userId)
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
                    membros: { $ne: userId }
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