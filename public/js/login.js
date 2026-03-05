async function login(){

const email = document.getElementById("email").value
const senha = document.getElementById("senha").value

const resposta = await fetch("/login",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
email,
senha
})

})

const dados = await resposta.json()

if(dados.token){

localStorage.setItem("token",dados.token)

window.location.href = "feed.html"

}else{

document.getElementById("msg").innerText = dados.erro

}

}