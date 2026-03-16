document.addEventListener("DOMContentLoaded", () => {

const fotoUsuario = document.getElementById("fotoUsuario");
const inputFoto = document.getElementById("trocarFoto");

fotoUsuario.addEventListener("click", () => {
    inputFoto.click();
});

inputFoto.addEventListener("change", async function () {

    const arquivo = this.files[0];

    if (!arquivo) return;

    const token = localStorage.getItem("token")

    const formData = new FormData();
    formData.append("foto", arquivo);

    const resposta = await fetch("/auth/foto", {
        method: "POST",
        headers: {
            Authorization: "Bearer " + token
        },
        body: formData
    });

    const dados = await resposta.json();

    if(dados.foto){
        fotoUsuario.src = dados.foto
    }

});

});