const jwt = require("jsonwebtoken");

const SECRET = "segredo_super_secreto";

module.exports = function (req, res, next) {

    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({ erro: "Token não enviado" });
    }


    const token = authHeader.split(" ")[1];

    try {

        const decoded = jwt.verify(token, SECRET);

        req.userId = decoded.id;

        next();

    } catch {

        res.status(401).json({ erro: "Token inválido" });

    }

};