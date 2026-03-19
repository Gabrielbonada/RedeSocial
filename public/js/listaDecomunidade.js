async function carregarComunidades() {

    const resposta = await fetch("/comunidades", {
        headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
        }
    })

    const comunidades = await resposta.json()

    const container = document.getElementById("comunidadesexistentes")

    container.innerHTML = ""

    comunidades.forEach(com => {

        container.innerHTML += `
   
  <div class="community-card">

   <img src="${com.imagem || 'https://via.placeholder.com/150'}" class="community-img">

    <div class="content-right">

        <div>
            <h3 class="community-name">${com.nome}</h3>
            <p class="community-desc">
                ${com.descricao}
            </p>
        </div>
        

        <div >

        <button class="join-btn" onclick="acessarComunidade('${com._id}')">
              Ver Comunidade
        </button>
        <button class="join-btn" onclick="toggleComunidade('${com._id}', ${com.participa})">
            ${com.participa ? "Sair" : "Entrar"}
        </button>


        <div/>
    </div>

</div>
   
   `

    })
}
window.toggleComunidade = async function (id, participa) {

    const token = localStorage.getItem("token")

    if (!token) {
        alert("Você precisa estar logado")
        window.location.href = "login.html"
        return
    }

    const url = participa
        ? `/comunidades/${id}/sair`
        : `/comunidades/${id}/entrar`

    try {
        await fetch(url, {
            method: "POST",
            headers: {
                Authorization: "Bearer " + token
            }
        })

        alert(participa ? "Saiu da comunidade" : "Entrou na comunidade")

        // 🔥 ATUALIZA TUDO
        carregarComunidades()
        carregarRelacionadas()
        carregarComunidadesDoUsuario()

    } catch (err) {
        console.error(err)
        alert("Erro ao atualizar comunidade")
    }
}

// inicialização
carregarComunidades()
carregarRelacionadas()
carregarComunidadesDoUsuario()