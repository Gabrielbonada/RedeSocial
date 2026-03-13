async function registrar(){

const nome = document.getElementById("nome").value
const email = document.getElementById("email").value
const senha = document.getElementById("senha").value

const resposta = await fetch("/auth/register",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
nome,
email,
senha
})

})

const dados = await resposta.json()

document.getElementById("msg").innerText = dados.mensagem || dados.erro

}