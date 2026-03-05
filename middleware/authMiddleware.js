const jwt = require("jsonwebtoken");

const SECRET = "segredo_super_secreto";

function authMiddleware(req, res, next) {

    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ erro: "Token não enviado" });
    }

    try {

        const decoded = jwt.verify(token, SECRET);

        req.userId = decoded.id;

        next();

    } catch (erro) {
        res.status(401).json({ erro: "Token inválido" });
    }

}

module.exports = authMiddleware;