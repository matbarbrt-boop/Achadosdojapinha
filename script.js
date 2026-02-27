// CONFIGURAÇÃO DO FIREBASE (Mantenha os seus dados aqui)
const firebaseConfig = {
    apiKey: "AIzaSyDlDFXXXFn017YX7lD4yyww7xmYI2v3DG4",
    authDomain: "achadosdojapa-e5fdf.firebaseapp.com",
    databaseURL: "https://achadosdojapa-e5fdf-default-rtdb.firebaseio.com",
    projectId: "achadosdojapa-e5fdf",
    storageBucket: "achadosdojapa-e5fdf.firebasestorage.app",
    messagingSenderId: "834499134262",
    appId: "1:834499134262:web:d831572fd00ba3748ca997"
};

// Inicialização
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Seletores de HTML
const productForm = document.getElementById('product-form');
const adminList = document.getElementById('admin-product-list');
const clientGrid = document.getElementById('client-grid');
const searchInput = document.getElementById('search-input');

// --- ESCUTAR MUDANÇAS NO BANCO DE DADOS ---
database.ref('products').on('value', (snapshot) => {
    const data = snapshot.val();
    const products = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
    
    // Atualiza a tela do Admin se ela existir
    if (adminList) renderAdmin(products);
    
    // Atualiza a Vitrine do Cliente se ela existir
    if (clientGrid) renderClient(products);
});

// --- FUNÇÃO PARA RENDERIZAR A VITRINE (CLIENTE) ---
function renderClient(products) {
    clientGrid.innerHTML = '';
    products.forEach(p => {
        // Lógica de promoção
        const precoOriginal = parseFloat(p.price);
        const precoPromo = p.promo ? parseFloat(p.promo) : null;
        const temPromo = precoPromo && precoPromo < precoOriginal;
        
        const porcentagem = temPromo ? Math.round(((precoOriginal - precoPromo) / precoOriginal) * 100) : 0;

        clientGrid.innerHTML += `
            <div class="product-card">
                <div class="product-img" style="background-image: url('${p.image}')"></div>
                <h3>${p.name}</h3>
                <div class="price-container">
                    ${temPromo ? `
                        <span class="price-old">R$ ${precoOriginal.toFixed(2)}</span>
                        <span class="discount-badge">-${porcentagem}%</span>
                        <div class="price-current">R$ ${precoPromo.toFixed(2)}</div>
                    ` : `
                        <div class="price-current">R$ ${precoOriginal.toFixed(2)}</div>
                    `}
                </div>
                <a href="${p.link}" target="_blank" class="buy-btn">Ver Produto</a>
            </div>
        `;
    });
}

// --- FUNÇÃO PARA RENDERIZAR O PAINEL (ADMIN) ---
function renderAdmin(products) {
    adminList.innerHTML = '';
    products.forEach(p => {
        adminList.innerHTML += `
            <div class="admin-item-card">
                <img src="${p.image}" alt="thumb">
                <span>${p.name}</span>
                <button onclick="deleteProduct('${p.id}')" class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
}

// --- SALVAR NOVO PRODUTO NO FIREBASE ---
if (productForm) {
    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const fileInput = document.getElementById('p-image');
        const file = fileInput.files[0];
        
        if (!file) {
            alert("Por favor, selecione uma imagem!");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const novoProduto = {
                name: document.getElementById('p-name').value,
                price: document.getElementById('p-price').value,
                promo: document.getElementById('p-promo').value,
                link: document.getElementById('p-link').value,
                image: reader.result // Salva a imagem como texto (Base64)
            };

            database.ref('products').push(novoProduto)
                .then(() => {
                    productForm.reset();
                    alert("Produto publicado com sucesso!");
                })
                .catch(error => console.error("Erro ao salvar:", error));
        };
        reader.readAsDataURL(file);
    });
}

// --- SISTEMA DE BUSCA ---
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.product-card');

        cards.forEach(card => {
            const nomeProduto = card.querySelector('h3').innerText.toLowerCase();
            if (nomeProduto.includes(termo)) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    });
}

// --- DELETAR PRODUTO ---
window.deleteProduct = (id) => {
    if (confirm("Tem certeza que deseja apagar este item?")) {
        database.ref('products/' + id).remove();
    }
};
