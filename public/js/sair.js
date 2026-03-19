document.getElementById("sair").addEventListener("click", function(e){

    e.preventDefault(); 

    localStorage.removeItem("token");

    window.location.href = "/login.html";

});

