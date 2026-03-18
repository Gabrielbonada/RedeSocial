async function carregarRelacionadas() {

    const token = localStorage.getItem("token")

    const resposta = await fetch("/comunidades/recomendadas", {
        headers: {
            Authorization: "Bearer " + token
        }
    })

    const comunidades = await resposta.json()

    const container = document.getElementById("lista-comunidades-relacionadas")

    container.innerHTML = ""

    comunidades.forEach(com => {

        container.innerHTML += `
   
  <div class="community-card">

    <img src=${com.imagem} class="community-img">

    <div class="content-right">

        <div>
            <h3 class="community-name">${com.nome}</h3>
            <p class="community-desc">
                ${com.descricao}
            </p>
        </div>

        <button class="join-btn">
            Entrar
        </button>

    </div>

  </div>
   `
    })

}

carregarRelacionadas()