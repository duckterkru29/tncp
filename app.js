// Global Store
let projectsData = [];
let articlesData = [];
let settingsData = {};
let cart = [];

// ==========================================
// CORE DATA LOADING
// ==========================================
async function init() {
    console.log("TNCP Platform Initializing...");
    try {
        const [projRes, artRes, setRes] = await Promise.all([
            fetch('data/projects.json').catch(e => ({ json: () => [] })),
            fetch('data/articles.json').catch(e => ({ json: () => [] })),
            fetch('data/settings.json').catch(e => ({ json: () => ({}) }))
        ]);

        projectsData = await projRes.json().catch(e => []);
        articlesData = await artRes.json().catch(e => []);
        settingsData = await setRes.json().catch(e => ({}));

        console.log("Data Loaded:", { projects: projectsData.length, articles: articlesData.length, settings: !!settingsData });

        renderUI();
        initScrollReveal();
        updateDynamicContent();

        // Track Page View
        trackAction('visit', 'Home Page');
    } catch (err) {
        console.error("Critical Error Loading Data:", err);
    }
}

function renderUI() {
    renderProjects(projectsData);
    renderMarketplace(projectsData);
    renderArticles(articlesData);
}

// ==========================================
// PROJECTS RENDERER (PORTFOLIO)
// ==========================================
function renderProjects(data) {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    grid.innerHTML = data.map(item => `
        <div class="glass-card rounded-[32px] overflow-hidden group reveal">
            <div class="relative aspect-video overflow-hidden">
                <img src="${item.thumbnail ? './uploads/' + item.thumbnail : `https://source.unsplash.com/800x600/?technology,code,${item.id}`}" 
                     class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                     alt="${item.title}">
                <div class="absolute inset-0 bg-gradient-to-t from-darker via-transparent to-transparent opacity-80"></div>
                ${item.isPopular ? `
                    <div class="absolute top-5 right-5 h-8 px-4 bg-accent/90 backdrop-blur-md rounded-full flex items-center gap-2 border border-white/20">
                        <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        <span class="text-[10px] font-black tracking-widest uppercase">Hot Product</span>
                    </div>
                ` : ''}
                <div class="absolute bottom-6 left-6 flex gap-2">
                    ${item.techStack.slice(0, 3).map(tech =>
        `<span class="px-3 py-1 glass border-white/10 rounded-lg text-[10px] font-bold text-gray-300 uppercase tracking-tighter">${tech}</span>`
    ).join('')}
                </div>
            </div>
            <div class="p-8 space-y-4">
                <div class="flex items-center gap-2 text-[10px] font-black text-primary tracking-[0.2em] uppercase">
                    <i data-lucide="tag" class="w-3 h-3"></i> ${item.category}
                </div>
                <h3 class="text-2xl font-display font-bold leading-tight group-hover:text-primary transition-colors">${item.title}</h3>
                <p class="text-gray-500 text-sm line-clamp-2 leading-relaxed">${item.description}</p>
                
                <div class="flex items-center justify-between pt-6 border-t border-white/5">
                    <div class="space-y-1">
                        <div class="text-sm text-gray-500 line-through decoration-accent/50 opacity-50">Rp ${(item.originalPrice / 1000).toFixed(0)}K</div>
                        <div class="text-2xl font-display font-black text-white">Rp ${(item.price / 1000).toFixed(0)}K</div>
                    </div>
                    <button onclick="addToCart('${item.title}', ${item.price}, './uploads/${item.thumbnail}', ${item.id})" 
                            class="p-4 bg-white/5 hover:bg-primary rounded-2xl transition-all group/btn">
                        <i data-lucide="shopping-cart" class="w-6 h-6 text-white group-hover/btn:scale-110 transition-transform"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
    initScrollReveal(); // Re-init to observe new elements
}

// ==========================================
// PORTFOLIO FILTERING
// ==========================================
window.filterProjects = (category) => {
    // Update active button UI
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        if (btn.getAttribute('data-filter') === category) {
            btn.classList.add('bg-white', 'text-darker');
            btn.classList.remove('text-gray-400', 'hover:text-white');
        } else {
            btn.classList.remove('bg-white', 'text-darker');
            btn.classList.add('text-gray-400', 'hover:text-white');
        }
    });

    // Filter Logic
    if (category === 'all') {
        renderProjects(projectsData);
    } else {
        const filtered = projectsData.filter(p => {
            if (!p.category) return false;
            return p.category.trim().toLowerCase() === category.trim().toLowerCase();
        });
        renderProjects(filtered);
    }

    // Track Filter Action
    trackAction('filter_portfolio', `User filter portfolio ke: ${category}`);
};

// ==========================================
// STORE RENDERER (MARKETPLACE)
// ==========================================
function renderMarketplace(data) {
    const grid = document.getElementById('store-grid');
    if (!grid) return;

    grid.innerHTML = data.slice(0, 4).map(item => `
        <div class="glass p-5 rounded-3xl space-y-4 hover:border-primary/50 transition-colors">
            <div class="aspect-square rounded-2xl overflow-hidden">
                <img src="${item.thumbnail ? './uploads/' + item.thumbnail : `https://source.unsplash.com/400x400/?software,app,${item.id}`}" class="w-full h-full object-cover">
            </div>
            <div class="text-left">
                <h4 class="font-bold text-sm line-clamp-1">${item.title}</h4>
                <div class="flex justify-between items-center mt-2">
                    <span class="text-accent font-black text-sm">Rp ${(item.price / 1000).toFixed(0)}K</span>
                    <button onclick="addToCart('${item.title}', ${item.price}, './uploads/${item.thumbnail}', ${item.id})" class="text-primary hover:text-white"><i data-lucide="plus-circle" class="w-5 h-5"></i></button>
                </div>
            </div>
        </div>
    `).join('');

    // Initialize Marked options
    marked.setOptions({
        breaks: true,
        gfm: true
    });

    if (window.lucide) lucide.createIcons();
    initScrollReveal();
}

// ==========================================
// ARTICLES RENDERER
// ==========================================
function renderArticles(data) {
    const grid = document.getElementById('articles-grid');
    if (!grid) return;

    grid.innerHTML = data.map(art => `
        <article class="group cursor-pointer reveal" onclick="viewArticle(${art.id})">
            <div class="glass-card rounded-[32px] overflow-hidden">
                <div class="relative h-56 overflow-hidden">
                    <img src="${art.coverImage ? './uploads/' + art.coverImage : `https://source.unsplash.com/800x600/?tech,it,${art.id}`}" 
                         class="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700">
                    <div class="absolute top-6 left-6">
                        <span class="px-4 py-1.5 bg-dark/80 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">${art.category}</span>
                    </div>
                </div>
                <div class="p-8 space-y-4">
                    <div class="flex items-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        <span><i data-lucide="calendar" class="inline w-3 h-3 mr-1"></i> ${new Date(art.publishedDate).toLocaleDateString()}</span>
                        <span><i data-lucide="clock" class="inline w-3 h-3 mr-1"></i> ${art.readTime} MIN READ</span>
                    </div>
                    <h3 class="text-xl font-display font-bold leading-tight group-hover:text-primary transition-colors">${art.title}</h3>
                    <p class="text-gray-500 text-sm line-clamp-3">${art.excerpt}</p>
                </div>
            </div>
        </article>
    `).join('');

    if (window.lucide) lucide.createIcons();
    initScrollReveal();
}

// ==========================================
// CART LOGIC
// ==========================================
window.addToCart = (title, price, img, id) => {
    const existing = cart.find(i => i.title === title);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ id, title, price, img, qty: 1 });
    }
    updateCart();
    showToast(`Berhasil menambahkan ${title}`);

    // TRACK INTEREST (Berapa kali ditambahkan ke keranjang)
    trackAction('interest', `Menambah ke keranjang: ${title}`, id);
};

function updateCart() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const badge = document.getElementById('cart-count');

    badge.innerText = cart.reduce((a, b) => a + b.qty, 0);
    badge.classList.toggle('hidden', cart.length === 0);

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-64 opacity-20">
                <i data-lucide="shopping-basket" class="w-20 h-20 mb-4"></i>
                <p class="font-bold">Keranjang Kosong</p>
            </div>
        `;
    } else {
        container.innerHTML = cart.map((item, idx) => `
            <div class="flex items-center gap-4 group">
                <div class="w-20 h-20 glass rounded-2xl overflow-hidden shrink-0">
                    <img src="${item.img || 'https://via.placeholder.com/80'}" class="w-full h-full object-cover">
                </div>
                <div class="flex-1 space-y-1">
                    <h4 class="font-bold text-sm leading-tight">${item.title}</h4>
                    <p class="text-xs text-gray-500">${item.qty} x Rp ${(item.price / 1000).toFixed(0)}K</p>
                </div>
                <button onclick="removeFromCart(${idx})" class="p-2 hover:bg-accent/10 hover:text-accent transition-colors rounded-lg">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        `).join('');
    }

    const total = cart.reduce((a, b) => a + (b.price * b.qty), 0);
    totalEl.innerText = `Rp ${(total / 1000).toFixed(0)}K`;

    if (window.lucide) lucide.createIcons();
}

window.removeFromCart = (idx) => {
    cart.splice(idx, 1);
    updateCart();
};

window.toggleCart = () => {
    document.getElementById('cart-sidebar').classList.toggle('translate-x-full');
};

window.checkout = () => {
    if (cart.length === 0) return showToast("Keranjang Anda masih kosong!");

    const items = cart.map(i => `\n- ${i.title} (${i.qty}x)`).join('');
    const total = cart.reduce((a, b) => a + (b.price * b.qty), 0);
    const msg = `Halo ${settingsData.name || 'Admin'}! Saya ingin membeli produk berikut:${items}\n\nTotal Estimasi: Rp ${total.toLocaleString('id-ID')}\n\nMohon diproses, terima kasih.`;

    window.open(`https://wa.me/${settingsData.whatsapp || '6281310387659'}?text=${encodeURIComponent(msg)}`, '_blank');

    // Track Checkout Order
    trackAction('order', `User klik checkout via WA untuk ${cart.length} item.`, cart.length === 1 ? cart[0].id : null);
};

// ==========================================
// UTILS
// ==========================================
function updateDynamicContent() {
    // Update Name footer & contact
    const nameEls = document.querySelectorAll('.dynamic-name');
    nameEls.forEach(el => el.innerText = settingsData.name);

    // Update Email
    const emailEls = document.querySelectorAll('.dynamic-email');
    emailEls.forEach(el => {
        el.innerText = settingsData.email;
        if (el.tagName === 'A') el.href = `mailto:${settingsData.email}`;
    });

    // Update WhatsApp
    const waEls = document.querySelectorAll('.dynamic-wa');
    waEls.forEach(el => el.innerText = '+' + settingsData.whatsapp);
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-message').innerText = msg;
    toast.classList.remove('translate-y-32', 'opacity-0');
    setTimeout(() => toast.classList.add('translate-y-32', 'opacity-0'), 3000);
}

function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// Start
document.addEventListener('DOMContentLoaded', init);

// ==========================================
// ARTICLE READER LOGIC
// ==========================================
window.viewArticle = (id) => {
    const art = articlesData.find(a => a.id === id);
    if (!art) return;

    const modal = document.getElementById('article-modal');
    const sidebar = document.getElementById('article-sidebar');

    // Fill Content
    document.getElementById('art-modal-title').innerText = art.title;
    document.getElementById('art-modal-category').innerText = art.category;
    document.getElementById('art-modal-date').innerText = new Date(art.publishedDate).toLocaleDateString();
    document.getElementById('art-modal-cover').src = art.coverImage ? './uploads/' + art.coverImage : `https://source.unsplash.com/800x600/?tech,it,${art.id}`;

    // Render Markdown
    const contentEl = document.getElementById('art-modal-content');
    contentEl.innerHTML = marked.parse(art.content || '*Tidak ada konten.*');

    // Highlight Code
    contentEl.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
        hljs.lineNumbersBlock(block);
    });

    modal.classList.remove('hidden');
    setTimeout(() => {
        sidebar.classList.remove('translate-x-full');
    }, 10);

    // Track Article View
    trackAction('read_article', `Membaca: ${art.title}`, art.id);
};

window.closeArticle = () => {
    const modal = document.getElementById('article-modal');
    const sidebar = document.getElementById('article-sidebar');

    sidebar.classList.add('translate-x-full');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 500);
};

window.shareArticle = () => {
    const title = document.getElementById('art-modal-title').innerText;
    const url = window.location.href;

    if (navigator.share) {
        navigator.share({
            title: title,
            text: `Baca artikel menarik ini: ${title}`,
            url: url
        }).catch(e => {
            // User cancelled or error
        });
    } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
            showToast('Link artikel disalin ke clipboard!');
        }).catch(() => {
            showToast('Gagal menyalin link.');
        });
    }
};

// ==========================================
// TRACKING SYSTEM
// ==========================================
async function trackAction(action, details = '', id = null) {
    try {
        await fetch('/api/stats/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, details, id })
        });
    } catch (e) {
        // console.warn("Tracker offline.");
    }
}

// ==========================================
// CONTACT HELPERS
// ==========================================
window.openWhatsApp = () => {
    const msg = `Halo ${settingsData.name || 'Admin'}! Saya tertarik untuk bekerja sama atau bertanya tentang layanan Anda.`;
    window.open(`https://wa.me/${settingsData.whatsapp || '6281310387659'}?text=${encodeURIComponent(msg)}`, '_blank');
    trackAction('order', 'User klik Let\'s Talk via Hero/Navbar');
};