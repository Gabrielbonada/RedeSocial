async function carregarComunidadesDoUsuario() {
    const token = localStorage.getItem("token");

    if (!token) {
        // Redirecionar para login se não houver token, ou lidar de outra forma
        console.log("Usuário não autenticado. Não é possível carregar comunidades do usuário.");
        return;
    }

    try {
        const resposta = await fetch("/comunidades/minhas", { // Supondo um endpoint /comunidades/minhas
            headers: {
                Authorization: "Bearer " + token
            }
        });

        if (!resposta.ok) {
            throw new Error(`Erro ao carregar comunidades do usuário: ${resposta.statusText}`);
        }

        const comunidadesDoUsuario = await resposta.json();
        const container = document.getElementById("comunidadesdousuario");

        container.innerHTML = ""; // Limpa o conteúdo existente

        if (comunidadesDoUsuario.length === 0) {
            container.innerHTML = "<p>Você ainda não participa de nenhuma comunidade.</p>";
        } else {
            comunidadesDoUsuario.forEach(com => {
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
                            <button class="join-btn" onclick="toggleComunidade('${com._id}', true )">
                                Sair
                            </button>
                        </div>
                    </div>
                `;
            });
        }
    } catch (error) {
        console.error("Falha ao carregar comunidades do usuário:", error);
        document.getElementById("comunidadesdousuario").innerHTML = "<p>Erro ao carregar suas comunidades.</p>";
    }
}

// Chame esta função na inicialização, junto com as outras
carregarComunidadesDoUsuario();
