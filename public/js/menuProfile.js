const links = document.querySelectorAll(".nav-item a")

const paginaAtual = window.location.pathname.split("/").pop()

links.forEach(link => {

    const item = link.parentElement

    if(link.getAttribute("href") === paginaAtual){
        item.classList.add("active")
    } else{
        item.classList.remove("active")
    }

})