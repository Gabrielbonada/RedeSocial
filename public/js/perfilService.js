// ============================================================
//  perfilService.js
//  Substitui o bloco <script> inline do perfil.html
//  Conecta todas as ações do perfil à API Node/Mongo
// ============================================================

const API = "";                          // deixe vazio se servir na mesma origem
const token = () => localStorage.getItem("token");
const headers = (isForm = false) => {
    const h = { Authorization: "Bearer " + token() };
    if (!isForm) h["Content-Type"] = "application/json";
    return h;
};

// ─── Estado local ─────────────────────────────────────────────────────────────
let posts             = [];
let stories           = [];
let currentViewPost   = null;
let currentStoryIndex = 0;
let storyTimer        = null;
let avatarSrc         = "";

// ══════════════════════════════════════════════════════════════
//  INIT — carrega tudo ao abrir a página
// ══════════════════════════════════════════════════════════════
async function initPerfil() {
    await carregarUsuario();
    await carregarPosts();
    await carregarStories();
}

// ─── Carrega dados do usuário logado ──────────────────────────
async function carregarUsuario() {
    const res     = await fetch(`${API}/auth/me`, { headers: headers() });
    const usuario = await res.json();

    avatarSrc = usuario.foto || "https://api.dicebear.com/7.x/adventurer/svg?seed=lucas";

    document.getElementById("avatar-img").src        = avatarSrc;
    document.getElementById("display-name").textContent     = usuario.nome;
    document.getElementById("display-username").textContent = "@" + (usuario.username || usuario.nome);
    document.getElementById("display-bio").textContent      = usuario.bio  || "";
    document.getElementById("display-link").textContent     = usuario.link || "";
    document.getElementById("display-link").href            = usuario.link || "#";

    // pré-preenche modal de edição
    document.getElementById("edit-name").value     = usuario.nome;
    document.getElementById("edit-username").value = usuario.username || "";
    document.getElementById("edit-bio").value      = usuario.bio      || "";
    document.getElementById("edit-link").value     = usuario.link     || "";

    // stats de seguidores/seguindo
    const statsRes  = await fetch(`${API}/perfil/stats`, { headers: headers() });
    const stats     = await statsRes.json();
    document.getElementById("stat-followers").textContent = formatNum(stats.seguidores);
    document.getElementById("stat-following").textContent = formatNum(stats.seguindo);
}

// ─── Carrega posts do usuário ──────────────────────────────────
async function carregarPosts() {
    const res = await fetch(`${API}/posts/meus`, { headers: headers() });
    posts     = await res.json();
    renderAllGrids();
}

// ─── Carrega stories do usuário ───────────────────────────────
async function carregarStories() {
    const res = await fetch(`${API}/posts/stories`, { headers: headers() });
    stories   = await res.json();
    renderStoriesRow();
}

// ══════════════════════════════════════════════════════════════
//  PERFIL — editar / salvar
// ══════════════════════════════════════════════════════════════
async function saveProfile() {
    const body = {
        nome:     document.getElementById("edit-name").value,
        username: document.getElementById("edit-username").value,
        bio:      document.getElementById("edit-bio").value,
        link:     document.getElementById("edit-link").value
    };

    const res     = await fetch(`${API}/perfil`, {
        method:  "PUT",
        headers: headers(),
        body:    JSON.stringify(body)
    });
    const usuario = await res.json();

    document.getElementById("display-name").textContent     = usuario.nome;
    document.getElementById("display-username").textContent = "@" + (usuario.username || usuario.nome);
    document.getElementById("display-bio").textContent      = usuario.bio  || "";
    document.getElementById("display-link").textContent     = usuario.link || "";

    closeModal("edit-modal");
    showToast("Perfil salvo! ✅");
}

// ─── Trocar avatar ─────────────────────────────────────────────
async function changeAvatar(e) {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("foto", file);

    const res  = await fetch(`${API}/auth/foto`, {
        method:  "POST",
        headers: { Authorization: "Bearer " + token() },
        body:    form
    });
    const data = await res.json();

    avatarSrc = data.foto;
    document.getElementById("avatar-img").src = data.foto;
    showToast("Foto atualizada! ✅");
}

// ══════════════════════════════════════════════════════════════
//  POSTS
// ══════════════════════════════════════════════════════════════
let postFileData = null;

function previewPost(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { postFileData = ev.target.result; showToast("Imagem carregada! 📸"); };
    reader.readAsDataURL(file);
}

async function publishPost() {
    const caption  = document.getElementById("post-caption").value.trim();
    const type     = document.getElementById("post-type").value;
    const fileInput = document.getElementById("post-file-input");

    const form = new FormData();
    form.append("caption", caption);
    form.append("type",    type);
    if (fileInput.files[0]) form.append("imagem", fileInput.files[0]);

    const res  = await fetch(`${API}/posts`, {
        method:  "POST",
        headers: { Authorization: "Bearer " + token() },
        body:    form
    });
    const post = await res.json();

    posts.unshift(post);
    renderAllGrids();
    closeModal("new-post-modal");
    postFileData = null;
    showToast("Publicado! 🎉");
}

async function deleteCurrentPost() {
    if (!confirm("Excluir publicação permanentemente?")) return;

    await fetch(`${API}/posts/${currentViewPost._id}`, {
        method:  "DELETE",
        headers: headers()
    });

    posts = posts.filter(p => p._id !== currentViewPost._id);
    renderAllGrids();
    document.getElementById("post-viewer-overlay").classList.remove("open");
    showToast("Post excluído! 🗑️");
}

// ─── Comentários ───────────────────────────────────────────────
async function addComment() {
    const input = document.getElementById("comment-input");
    if (!input.value.trim()) return;

    const res  = await fetch(`${API}/posts/${currentViewPost._id}/comentarios`, {
        method:  "POST",
        headers: headers(),
        body:    JSON.stringify({ texto: input.value })
    });
    const comments = await res.json();

    currentViewPost.comments = comments;
    input.value = "";
    renderComments();
    renderAllGrids();
}

async function deleteComment(cid) {
    if (!confirm("Excluir comentário?")) return;

    await fetch(`${API}/posts/${currentViewPost._id}/comentarios/${cid}`, {
        method:  "DELETE",
        headers: headers()
    });

    currentViewPost.comments = currentViewPost.comments.filter(c => c._id !== cid);
    renderComments();
    renderAllGrids();
}

// ══════════════════════════════════════════════════════════════
//  STORIES
// ══════════════════════════════════════════════════════════════
async function publishStory(e) {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("imagem", file);

    const res   = await fetch(`${API}/posts/stories`, {
        method:  "POST",
        headers: { Authorization: "Bearer " + token() },
        body:    form
    });
    const story = await res.json();

    stories.unshift(story);
    renderStoriesRow();
    closeModal("new-story-modal");
    showToast("Story postado! 🌟");
}

async function deleteCurrentStory() {
    if (!confirm("Excluir este story?")) return;

    await fetch(`${API}/posts/stories/${stories[currentStoryIndex]._id}`, {
        method:  "DELETE",
        headers: headers()
    });

    stories.splice(currentStoryIndex, 1);
    renderStoriesRow();
    stories.length ? renderStory() : closeStoryViewer();
    showToast("Story excluído! 🗑️");
}

// ══════════════════════════════════════════════════════════════
//  RENDER HELPERS
// ══════════════════════════════════════════════════════════════
function renderGrid(containerId, items) {
    const grid = document.getElementById(containerId);
    if (!grid) return;
    grid.innerHTML = items.length
        ? ""
        : '<p style="color:var(--text2);grid-column:1/-1;text-align:center;padding:40px">Nenhuma publicação.</p>';

    items.forEach(p => {
        const div = document.createElement("div");
        div.className = "post-item";
        div.onclick   = () => openPostViewer(p);
        div.innerHTML = `
            <div class="post-img-container">
                <img src="${p.src}" alt="Post"/>
            </div>
            <div class="post-content">
                <div class="post-title">${p.type === "reel" ? "Reel" : "Publicação"}</div>
                <div class="post-desc">${(p.caption || "").substring(0, 80)}${(p.caption || "").length > 80 ? "..." : ""}</div>
                <div class="post-footer">
                    <span class="post-tag ${p.type}">${p.type}</span>
                    <div style="display:flex;align-items:center">
                        <button class="btn-view">Ver Post</button>
                        <div class="post-actions-icons">
                            <div class="icon-circle">
                                <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            </div>
                            <div class="icon-circle" style="background:#ff2a68">
                                <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        grid.appendChild(div);
    });
}

function renderAllGrids() {
    renderGrid("posts-grid", posts);
    renderGrid("reels-grid", posts.filter(p => p.type === "reel"));
    document.getElementById("stat-posts").textContent = posts.length;
}

function renderStoriesRow() {
    const row = document.getElementById("stories-row");
    row.innerHTML = `
        <div class="story-item">
            <button class="story-add-btn" onclick="openModal('new-story-modal')">+</button>
            <span class="story-label" style="font-size:11px;color:var(--text2)">Novo</span>
        </div>`;
    stories.forEach((s, i) => {
        const div = document.createElement("div");
        div.className = "story-item";
        div.onclick   = () => openStory(i);
        div.innerHTML = `
            <div class="story-ring"><img src="${s.src}"/></div>
            <span class="story-label" style="font-size:11px;color:var(--text2)">story</span>`;
        row.appendChild(div);
    });
}

function openPostViewer(post) {
    currentViewPost = post;
    document.getElementById("pv-img").src                 = post.src;
    document.getElementById("pv-avatar").src              = avatarSrc;
    document.getElementById("pv-caption").textContent     = post.caption;
    renderComments();
    document.getElementById("post-viewer-overlay").classList.add("open");
}

function renderComments() {
    const list = document.getElementById("pv-comments-list");
    list.innerHTML = (currentViewPost.comments || []).map(c => `
        <div class="comment-item">
            <img src="${avatarSrc}"/>
            <div style="flex:1">
                <strong>@usuario</strong> <span style="font-size:13px">${c.texto}</span>
                <button onclick="deleteComment('${c._id}')" class="btn-delete">Excluir</button>
            </div>
        </div>`).join("");
}

// ─── Story viewer ──────────────────────────────────────────────
function openStory(index) {
    currentStoryIndex = index;
    renderStory();
    document.getElementById("story-viewer-overlay").classList.add("open");
    startStoryTimer();
}

function renderStory() {
    const s = stories[currentStoryIndex];
    if (!s) return closeStoryViewer();
    document.getElementById("sv-content").innerHTML =
        `<img src="${s.src}" style="width:100%;height:100%;object-fit:cover"/>`;

    const bar = document.getElementById("story-progress-bar");
    bar.innerHTML = stories.map((_, i) =>
        `<div class="story-seg"><div class="story-seg-fill" id="seg-${i}" style="width:${i < currentStoryIndex ? "100%" : "0%"}"></div></div>`
    ).join("");
}

function startStoryTimer() {
    clearInterval(storyTimer);
    let w = 0;
    storyTimer = setInterval(() => {
        w++;
        const seg = document.getElementById(`seg-${currentStoryIndex}`);
        if (seg) seg.style.width = w + "%";
        if (w >= 100) { clearInterval(storyTimer); nextStory(); }
    }, 50);
}

function nextStory() { currentStoryIndex < stories.length - 1 ? openStory(currentStoryIndex + 1) : closeStoryViewer(); }
function prevStory()  { if (currentStoryIndex > 0) openStory(currentStoryIndex - 1); }
function closeStoryViewer() { clearInterval(storyTimer); document.getElementById("story-viewer-overlay").classList.remove("open"); }

// ══════════════════════════════════════════════════════════════
//  UI HELPERS
// ══════════════════════════════════════════════════════════════
function formatNum(n) { return n >= 1000 ? (n / 1000).toFixed(1) + "K" : n; }
function switchTab(tab, btn) {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    ["posts", "reels", "saved"].forEach(t =>
        document.getElementById("tab-" + t).style.display = t === tab ? "block" : "none"
    );
}
function openModal(id)        { document.getElementById(id).classList.add("open");    }
function closeModal(id)       { document.getElementById(id).classList.remove("open"); }
function closePostViewer(e)   { if (e.target.id === "post-viewer-overlay") closeModal("post-viewer-overlay"); }
function showToast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 3000);
}

// ─── Inicia tudo ───────────────────────────────────────────────
initPerfil();