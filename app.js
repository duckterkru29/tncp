// app.js - Main Application Logic

// State Management
let cart = [];
let currentFilter = 'all';
let projectsData = [];
let articlesData = [];

// Cache mechanism
const cache = {
    projects: null,
    articles: null,
    lastFetch: null
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// API Functions
async function fetchFromAPI(endpoint) {
    try {
        const response = await fetch(`${CONFIG.API_URL}${endpoint}?populate=*`);
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('API Error:', error);
        return loadFallbackData(endpoint);
    }
}

function loadFallbackData(endpoint) {
    // Fallback ke data statis jika API fail
    if (endpoint.includes('projects')) {
        return [
            {
                id: 1,
                attributes: {
                    title: "Sistem Inventory Pro",
                    slug: "sistem-inventory-pro",
                    description: "Sistem manajemen inventory lengkap dengan barcode scanner",
                    category: "system",
                    price: 2500000,
                    originalPrice: 5000000,
                    isAvailable: true,
                    isPopular: true,
                    techStack: [{ name: "Laravel" }, { name: "Vue.js" }, { name: "MySQL" }],
                    features: [{ text: "Multi-cabang" }, { text: "Barcode Scanner" }, { text: "Laporan PDF" }],
                    thumbnail: { data: { attributes: { url: "/placeholder-project.jpg" } } },
                    salesCount: 45
                }
            }
        ];
    }
    return [];
}

// Transform Functions
function transformProject(item) {
    const attrs = item.attributes || item;
    return {
        id: item.id,
        title: attrs.title,
        slug: attrs.slug,
        description: attrs.description,
        category: attrs.category,
        price: attrs.price,
        originalPrice: attrs.originalPrice,
        isAvailable: attrs.isAvailable !== false,
        isPopular: attrs.isPopular || false,
        techStack: (attrs.techStack || []).map(t => t.name || t),
        features: (attrs.features || []).map(f => f.text || f),
        thumbnail: attrs.thumbnail?.data?.attributes?.url
            ? `${CONFIG.IMAGE_URL}${attrs.thumbnail.data.attributes.url}`
            : `https://via.placeholder.com/600x400/6366f1/ffffff?text=${encodeURIComponent(attrs.title)}`,
        screenshots: (attrs.screenshots?.data || []).map(img =>
            `${CONFIG.IMAGE_URL}${img.attributes.url}`
        ),
        demoUrl: attrs.demoUrl,
        githubUrl: attrs.githubUrl,
        salesCount: attrs.salesCount || 0
    };
}

function transformArticle(item) {
    const attrs = item.attributes || item;
    return {
        id: item.id,
        title: attrs.title,
        slug: attrs.slug,
        excerpt: attrs.excerpt,
        content: attrs.content,
        coverImage: attrs.coverImage?.data?.attributes?.url
            ? `${CONFIG.IMAGE_URL}${attrs.coverImage.data.attributes.url}`
            : `https://via.placeholder.com/600x400/a855f7/ffffff?text=${encodeURIComponent(attrs.title)}`,
        category: attrs.category?.data?.attributes?.name || 'Tech',
        tags: (attrs.tags?.data || []).map(t => t.attributes?.name || t),
        readTime: attrs.readTime || 5,
        publishedDate: attrs.publishedDate || attrs.createdAt || new Date().toISOString(),
        views: attrs.views || 0
    };
}

// Render Functions
async function renderProjects() {
    const container = document.getElementById('projects-grid');
    if (!container) return;

    try {
        const data = await fetchFromAPI('/projects');
        projectsData = data.map(transformProject).filter(p => p.isAvailable);

        displayProjects(projectsData);
    } catch (error) {
        container.innerHTML = '<div class="col-span-full text-center text-red-400">Failed to load projects</div>';
    }
}

function displayProjects(projects) {
    const container = document.getElementById('projects-grid');

    if (projects.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-gray-400">No projects found</div>';
        return;
    }

    container.innerHTML = projects.map(project => `
        <div class="project-card group reveal" data-category="${project.category}">
            <div class="glass rounded-3xl overflow-hidden card-hover h-full flex flex-col">
                <div class="relative overflow-hidden">
                    <img src="${project.thumbnail}" 
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

    // Reuse projects data or fetch
    if (projectsData.length === 0) {
        const data = await fetchFromAPI('/projects');
        projectsData = data.map(transformProject).filter(p => p.isAvailable);
    }

    displayStore(projectsData);
}

function displayStore(products) {
    const container = document.getElementById('store-grid');

    container.innerHTML = products.map(product => `
        <div class="glass rounded-3xl overflow-hidden card-hover reveal group h-full flex flex-col">
            <div class="relative">
                <img src="${product.thumbnail}" class="w-full h-48 object-cover" alt="${product.title}">
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

    try {
        const data = await fetchFromAPI('/articles');
        articlesData = data.map(transformArticle);

        displayArticles(articlesData);
    } catch (error) {
        container.innerHTML = '<div class="col-span-full text-center text-gray-400">Failed to load articles</div>';
    }
}

function displayArticles(articles) {
    const container = document.getElementById('articles-grid');

    container.innerHTML = articles.map(article => `
        <article class="glass rounded-3xl overflow-hidden card-hover reveal group cursor-pointer" onclick="showArticleDetail('${article.slug}')">
            <div class="relative overflow-hidden">
                <img src="${article.coverImage}" 
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

// Filter Functions
function filterProjects(category) {
    currentFilter = category;

    // Update buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.dataset.filter === category) {
            btn.classList.add('bg-primary', 'text-white');
            btn.classList.remove('glass');
        } else {
            btn.classList.remove('bg-primary', 'text-white');
            btn.classList.add('glass');
        }
    });

    // Filter and display
    const filtered = category === 'all'
        ? projectsData
        : projectsData.filter(p => p.category === category);

    displayProjects(filtered);
}

// Cart Functions
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

    // Update count badge
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (totalItems > 0) {
        cartCount.textContent = totalItems;
        cartCount.classList.remove('hidden');
    } else {
        cartCount.classList.add('hidden');
    }

    // Update items
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

    // Update total
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

// UI Functions
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

    // Simple modal atau redirect ke detail page
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderProjects();
    renderStore();
    renderArticles();
});