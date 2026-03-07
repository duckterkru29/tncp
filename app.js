// app.js - Main Application Logic (Static JSON Version - GitHub Pages Ready)

const CONFIG = {
    WHATSAPP_NUMBER: '6281310387659'
};

// State Management
let cart = [];
let currentFilter = 'all';
let projectsData = [];
let articlesData = [];

// ==========================================
// FETCH DATA DARI FILE JSON STATIS
// ==========================================
async function fetchProjects() {
    try {
        const response = await fetch('data/projects.json');
        if (!response.ok) throw new Error('Gagal memuat projects');
        return await response.json();
    } catch (error) {
        console.error('Error loading projects:', error);
        return [];
    }
}

async function fetchArticles() {
    try {
        const response = await fetch('data/articles.json');
        if (!response.ok) throw new Error('Gagal memuat articles');
        return await response.json();
    } catch (error) {
        console.error('Error loading articles:', error);
        return [];
    }
}

// ==========================================
// RENDER FUNCTIONS
// ==========================================
async function renderProjects() {
    const container = document.getElementById('projects-grid');
    if (!container) return;

    projectsData = (await fetchProjects()).filter(p => p.isAvailable);
    displayProjects(projectsData);
}

function displayProjects(projects) {
    const container = document.getElementById('projects-grid');

    if (projects.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-gray-400 py-12">Belum ada project tersedia</div>';
        return;
    }

    container.innerHTML = projects.map(project => `
        <div class="project-card group reveal" data-category="${project.category}">
            <div class="glass rounded-3xl overflow-hidden card-hover h-full flex flex-col">
                <div class="relative overflow-hidden">
                    <img src="${project.thumbnail || `https://via.placeholder.com/600x400/6366f1/ffffff?text=${encodeURIComponent(project.title)}`}"
                         class="w-full h-56 object-cover transform group-hover:scale-110 transition-transform duration-500"
                         alt="${project.title}" loading="lazy">
                    ${project.isPopular ? '<div class="absolute top-4 right-4 bg-accent text-white px-3 py-1 rounded-full text-xs font-bold">POPULAR</div>' : ''}
                    <div class="absolute inset-0 bg-gradient-to-t from-darker to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                        <div class="flex gap-2 flex-wrap">
                            ${project.techStack.slice(0, 3).map(tech =>
        `<span class="px-3 py-1 bg-primary/80 rounded-full text-xs font-medium">${tech}</span>`
    ).join('')}
                        </div>
                    </div>
                </div>
                <div class="p-6 flex-1 flex flex-col">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="px-2 py-1 bg-primary/20 text-primary rounded text-xs font-medium uppercase">${project.category}</span>
                    </div>
                    <h3 class="font-display text-xl font-bold mb-2">${project.title}</h3>
                    <p class="text-gray-400 text-sm mb-4 line-clamp-2">${project.description}</p>
                    
                    <div class="mt-auto">
                        <div class="flex justify-between items-center mb-4">
                            <div>
                                <p class="text-2xl font-bold gradient-text">Rp ${(project.price / 1000).toFixed(0)}K</p>
                                ${project.originalPrice ? `<p class="text-xs text-gray-500 line-through">Rp ${(project.originalPrice / 1000).toFixed(0)}K</p>` : ''}
                            </div>
                            <span class="text-xs text-gray-400">${project.salesCount} sales</span>
                        </div>

                        <div class="flex gap-2">
                            <button onclick="showProjectDetail('${project.slug}')"
                                    class="flex-1 py-2 rounded-xl glass hover:bg-white/10 transition-colors text-sm font-medium">
                                Detail
                            </button>
                            <button onclick="addToCart('${project.title}', ${project.price})"
                                    class="flex-1 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all text-sm font-medium">
                                Beli
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Re-init observer for new elements
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

async function renderStore() {
    const container = document.getElementById('store-grid');
    if (!container) return;

    if (projectsData.length === 0) {
        projectsData = (await fetchProjects()).filter(p => p.isAvailable);
    }

    displayStore(projectsData);
}

function displayStore(products) {
    const container = document.getElementById('store-grid');

    container.innerHTML = products.map(product => `
        <div class="glass rounded-3xl overflow-hidden card-hover reveal group h-full flex flex-col">
            <div class="relative">
                <img src="${product.thumbnail || `https://via.placeholder.com/600x400/6366f1/ffffff?text=${encodeURIComponent(product.title)}`}" class="w-full h-48 object-cover" alt="${product.title}">
                ${product.isPopular ? '<div class="absolute top-4 right-4 bg-accent text-white px-3 py-1 rounded-full text-xs font-bold">POPULER</div>' : ''}
            </div>
            <div class="p-6 flex-1 flex flex-col">
                <div class="flex items-center gap-2 mb-3">
                    ${product.techStack.slice(0, 2).map(tech =>
        `<span class="px-2 py-1 bg-primary/20 text-primary rounded text-xs">${tech}</span>`
    ).join('')}
                </div>
                <h3 class="font-display text-xl font-bold mb-2">${product.title}</h3>
                <p class="text-gray-400 text-sm mb-4 line-clamp-2">${product.description}</p>
                
                <div class="space-y-2 mb-4">
                    ${product.features.slice(0, 3).map(feat => `
                        <div class="flex items-center gap-2 text-sm text-gray-300">
                            <i data-lucide="check-circle" class="w-4 h-4 text-primary"></i>
                            <span>${feat}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="mt-auto pt-4 border-t border-white/10">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-2xl font-bold gradient-text">Rp ${(product.price / 1000).toFixed(0)}K</p>
                            ${product.originalPrice ? `<p class="text-xs text-gray-500 line-through">Rp ${(product.originalPrice / 1000).toFixed(0)}K</p>` : ''}
                        </div>
                        <button onclick="addToCart('${product.title}', ${product.price})"
                                class="bg-gradient-to-r from-primary to-secondary px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all">
                            <i data-lucide="shopping-cart" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

async function renderArticles() {
    const container = document.getElementById('articles-grid');
    if (!container) return;

    articlesData = await fetchArticles();
    displayArticles(articlesData);
}

function displayArticles(articles) {
    const container = document.getElementById('articles-grid');

    if (articles.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-gray-400 py-12">Belum ada artikel</div>';
        return;
    }

    container.innerHTML = articles.map(article => `
        <article class="glass rounded-3xl overflow-hidden card-hover reveal group cursor-pointer" onclick="showArticleDetail('${article.slug}')">
            <div class="relative overflow-hidden">
                <img src="${article.coverImage || `https://via.placeholder.com/600x400/a855f7/ffffff?text=${encodeURIComponent(article.title)}`}"
                     class="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500"
                     alt="${article.title}" loading="lazy">
                <div class="absolute top-4 left-4">
                    <span class="px-3 py-1 bg-primary/90 rounded-full text-xs font-medium">${article.category}</span>
                </div>
            </div>
            <div class="p-6">
                <div class="flex items-center gap-4 text-sm text-gray-400 mb-3">
                    <span class="flex items-center gap-1">
                        <i data-lucide="calendar" class="w-4 h-4"></i>
                        ${new Date(article.publishedDate).toLocaleDateString('id-ID')}
                    </span>
                    <span class="flex items-center gap-1">
                        <i data-lucide="clock" class="w-4 h-4"></i>
                        ${article.readTime} min
                    </span>
                </div>
                <h3 class="font-display text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">${article.title}</h3>
                <p class="text-gray-400 text-sm mb-4 line-clamp-2">${article.excerpt}</p>
                <div class="flex flex-wrap gap-2 mb-4">
                    ${article.tags.slice(0, 3).map(tag =>
        `<span class="px-2 py-1 bg-white/5 rounded text-xs text-gray-400">#${tag}</span>`
    ).join('')}
                </div>
                <span class="text-primary text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Baca Selengkapnya <i data-lucide="arrow-up-right" class="w-4 h-4"></i>
                </span>
            </div>
        </article>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

// ==========================================
// FILTER FUNCTIONS
// ==========================================
function filterProjects(category) {
    currentFilter = category;

    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.dataset.filter === category) {
            btn.classList.add('bg-primary', 'text-white');
            btn.classList.remove('glass');
        } else {
            btn.classList.remove('bg-primary', 'text-white');
            btn.classList.add('glass');
        }
    });

    const filtered = category === 'all'
        ? projectsData
        : projectsData.filter(p => p.category === category);

    displayProjects(filtered);
}

// ==========================================
// CART FUNCTIONS
// ==========================================
function addToCart(name, price) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    updateCartUI();
    showToast(`${name} ditambahkan ke keranjang`);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function updateCartUI() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (totalItems > 0) {
        cartCount.textContent = totalItems;
        cartCount.classList.remove('hidden');
    } else {
        cartCount.classList.add('hidden');
    }

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="text-gray-400 text-center py-8">Keranjang kosong</p>';
    } else {
        cartItems.innerHTML = cart.map((item, index) => `
            <div class="glass rounded-xl p-4 flex justify-between items-center">
                <div>
                    <h4 class="font-semibold text-sm">${item.name}</h4>
                    <p class="text-primary text-sm">Rp ${(item.price / 1000).toFixed(0)}K x ${item.quantity}</p>
                </div>
                <button onclick="removeFromCart(${index})" class="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        `).join('');
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `Rp ${(total / 1000).toFixed(0)}K`;

    if (window.lucide) lucide.createIcons();
}

function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('translate-x-full');
}

function checkout() {
    if (cart.length === 0) {
        showToast('Keranjang masih kosong!');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemsList = cart.map(item => `- ${item.name} (${item.quantity}x)`).join('%0A');

    const message = `Halo, saya ingin membeli source code:%0A%0A${itemsList}%0A%0ATotal: Rp ${total.toLocaleString()}%0A%0AMohon informasi pembayaran.`;

    window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${message}`, '_blank');
}

// ==========================================
// UI FUNCTIONS
// ==========================================
function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-message').textContent = message;
    toast.classList.remove('translate-y-20', 'opacity-0');

    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

function showProjectDetail(slug) {
    const project = projectsData.find(p => p.slug === slug);
    if (!project) return;

    alert(`Detail Project: ${project.title}\n\n${project.description}\n\nTech: ${project.techStack.join(', ')}`);
}

function showArticleDetail(slug) {
    const article = articlesData.find(a => a.slug === slug);
    if (!article) return;

    alert(`Artikel: ${article.title}\n\n${article.excerpt}`);
}

function handleSubmit(e) {
    e.preventDefault();
    showToast('Pesan berhasil dikirim! Saya akan menghubungi Anda segera.');
    e.target.reset();
}

// ==========================================
// INITIALIZE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    renderProjects();
    renderStore();
    renderArticles();
});