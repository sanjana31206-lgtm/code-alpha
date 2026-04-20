// ===== CART =====
const Cart = {
  get: () => JSON.parse(localStorage.getItem('cart') || '[]'),
  save: (cart) => { localStorage.setItem('cart', JSON.stringify(cart)); Cart.updateCount(); },
  add(product) {
    const cart = Cart.get();
    const existing = cart.find(i => i.id === product.id);
    if (existing) existing.qty++;
    else cart.push({ ...product, qty: 1 });
    Cart.save(cart);
    showToast(`✅ ${product.name} added to cart!`, 'success');
  },
  remove(id) {
    Cart.save(Cart.get().filter(i => i.id !== id));
  },
  updateQty(id, qty) {
    const cart = Cart.get();
    const item = cart.find(i => i.id === id);
    if (item) { item.qty = qty; if (item.qty <= 0) return Cart.remove(id); }
    Cart.save(cart);
  },
  total: () => Cart.get().reduce((sum, i) => sum + i.price * i.qty, 0),
  count: () => Cart.get().reduce((sum, i) => sum + i.qty, 0),
  clear: () => { localStorage.removeItem('cart'); Cart.updateCount(); },
  updateCount() {
    const el = document.getElementById('cart-count');
    if (el) { const c = Cart.count(); el.textContent = c; el.style.display = c > 0 ? 'flex' : 'none'; }
  }
};

// ===== AUTH =====
const Auth = {
  get: () => JSON.parse(localStorage.getItem('user') || 'null'),
  set: (user) => localStorage.setItem('user', JSON.stringify(user)),
  clear: () => localStorage.removeItem('user'),
  isLoggedIn: () => !!Auth.get()
};

// ===== API =====
const API = {
  base: '',
  async get(url) {
    const res = await fetch(this.base + url);
    return res.json();
  },
  async post(url, data) {
    const res = await fetch(this.base + url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};

// ===== TOAST =====
function showToast(msg, type = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== NAVBAR =====
function renderNavbar() {
  const user = Auth.get();
  const cartCount = Cart.count();
  const nav = document.getElementById('navbar');
  if (!nav) return;
  nav.innerHTML = `
    <div class="nav-inner">
      <a href="/index.html" class="nav-logo">CodeAlpha <span>Pro</span></a>
      <div class="nav-search">
        <input type="text" id="search-input" placeholder="Search products..." value="${new URLSearchParams(location.search).get('search') || ''}">
        <button onclick="doSearch()">🔍</button>
      </div>
      <div class="nav-actions">
        <a href="/cart.html" class="nav-btn">
          🛒 Cart <span class="cart-count" id="cart-count" style="display:${cartCount > 0 ? 'flex' : 'none'}">${cartCount}</span>
        </a>
        ${user
          ? `<a href="/dashboard.html" class="nav-btn">👤 ${user.name.split(' ')[0]}</a>
             <button class="nav-btn" onclick="logout()">Logout</button>`
          : `<a href="/login.html" class="nav-btn primary">Login</a>`
        }
      </div>
    </div>`;
  document.getElementById('search-input').addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
}

function doSearch() {
  const q = document.getElementById('search-input').value.trim();
  if (q) window.location.href = `/index.html?search=${encodeURIComponent(q)}`;
}

function logout() {
  Auth.clear();
  showToast('Logged out successfully');
  setTimeout(() => window.location.href = '/index.html', 800);
}

// ===== STARS =====
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half);
}

// ===== DISCOUNT =====
function calcDiscount(price, original) {
  return Math.round((1 - price / original) * 100);
}

// ===== FORMAT PRICE =====
function fmt(price) {
  return '₹' + price.toLocaleString('en-IN');
}

// Init navbar on load
document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  Cart.updateCount();
});
