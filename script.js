// Configuração do Firebase (conforme fornecido por você)
const firebaseConfig = {
    apiKey: "AIzaSyDlDFXXXFn017YX7lD4yyww7xmYI2v3DG4",
    authDomain: "achadosdojapa-e5fdf.firebaseapp.com",
    databaseURL: "https://achadosdojapa-e5fdf-default-rtdb.firebaseio.com",
    projectId: "achadosdojapa-e5fdf",
    storageBucket: "achadosdojapa-e5fdf.firebasestorage.app",
    messagingSenderId: "834499134262",
    appId: "1:834499134262:web:d831572fd00ba3748ca997"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Elementos
const productForm = document.getElementById('product-form');
const adminList = document.getElementById('admin-product-list');
const clientGrid = document.getElementById('client-grid');
const searchInput = document.getElementById('search-input');

// --- ESCREVER (ADMIN) ---
if (productForm) {
    productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const file = document.getElementById('p-image').files[0];
        const reader = new FileReader();

        reader.onloadend = function() {
            const newProduct = {
                name: document.getElementById('p-name').value,
                price: document.getElementById('p-price').value,
                promo: document.getElementById('p-promo').value,
                link: document.getElementById('p-link').value,
                image: reader.result
            };

            database.ref('products').push(newProduct);
            productForm.reset();
            alert("Publicado com sucesso!");
        }
        if (file) reader.readAsDataURL(file);
    });
}

// --- LER (CLIENTE E ADMIN) ---
database.ref('products').on('value', (snapshot) => {
    const data = snapshot.val();
    const products = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
    
    if (adminList) renderAdminItems(products);
    if (clientGrid) renderClientItems(products);
});

// --- BUSCA ---
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('.product-card').forEach(card => {
            const title = card.querySelector('h3').innerText.toLowerCase();
            card.classList.toggle('hidden', !title.includes(term));
        });
    });
}

// --- RENDERIZAÇÃO ---
function renderAdminItems(products) {
    adminList.innerHTML = '';
    products.forEach(p => {
        adminList.innerHTML += `
            <div class="admin-item-card">
                <img src="${p.image}">
                <span>${p.name}</span>
                <button onclick="deleteProduct('${p.id}')" class="delete-btn">Excluir</button>
            </div>
        `;
    });
}

function renderClientItems(products) {
    clientGrid.innerHTML = '';
    products.forEach(p => {
        const hasPromo = p.promo && p.promo !== "" && parseFloat(p.promo) < parseFloat(p.price);
        const perc = hasPromo ? Math.round(((p.price - p.promo) / p.price) * 100) : 0;

        clientGrid.innerHTML += `
            <div class="product-card">
                <div class="product-img" style="background-image: url('${p.image}')"></div>
                <h3>${p.name}</h3>
                <div class="price-container">
                    ${hasPromo ? `
                        <div class="promo-row">
                            <span class="price-old">R$ ${p.price}</span>
                            <span class="discount-tag">-${perc}%</span>
                        </div>
                        <span class="price-current">R$ ${p.promo}</span>
                    ` : `<span class="price-current">R$ ${p.price}</span>`}
                </div>
                <a href="${p.link}" target="_blank" class="buy-link-btn">Ver Produto</a>
            </div>
        `;
    });
}

// --- DELETAR ---
window.deleteProduct = function(id) {
    if(confirm("Remover permanentemente?")) {
        database.ref('products/' + id).remove();
    }
}