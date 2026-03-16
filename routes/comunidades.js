const express = require("express");
const router = express.Router();

const Community = require("../models/comunidade");


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
router.get("/", async (req, res) => {

    const communities = await Community.find();

    res.json(communities);

});


module.exports = router;