const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

app.use(express.json());

// pasta public
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect("mongodb://localhost:27017/redesocial")
.then(() => console.log("Mongo conectado"));

const authRoutes = require("./routes/auth.js");
const postRoutes = require("./routes/posts.js");
const CommunityRoutes = require('./routes/comunidades.js')

app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/comunidades", CommunityRoutes);
app.use("/uploads", express.static("uploads"));

// abrir index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(3000, () => {
    console.log("Servidor rodando");
});