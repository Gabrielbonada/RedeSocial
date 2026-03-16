document.getElementById("sair").addEventListener("click", function(e){

    e.preventDefault(); // impede o link de recarregar a página

    localStorage.removeItem("token");

    window.location.href = "/login.html";

});