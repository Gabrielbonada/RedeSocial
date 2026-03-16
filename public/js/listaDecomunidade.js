async function carregarComunidades(){

 const resposta = await fetch("/comunidades")

 const comunidades = await resposta.json()

 const container = document.getElementById("lista-comunidades")

 container.innerHTML = ""

 comunidades.forEach(com => {

   container.innerHTML += `
   
   <div class="community-card">

       <img src="${com.imagem}" class="community-img">

       <h3>${com.nome}</h3>

       <p>${com.descricao}</p>

   </div>
   
   `

 })

}

carregarComunidades()