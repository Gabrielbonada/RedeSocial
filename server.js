const express = require("express");
const app = express();

app.get('/' , (req , res) => {

})






app.use(express.json());
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/redesocial")
.then(() => console.log("Mongo conectado"));


const authRoutes = require("./routes/auth");


app.use(authRoutes);
//app.use(postRoutes);

app.listen(3000, () => {
    console.log("Servidor rodando");
});