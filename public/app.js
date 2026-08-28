// ============================================
// GRANJA DE AGUADA - HTML5 + Vanilla JavaScript
// ============================================

// --- STATE ---
let currentView = 'home';
let selectedProductId = null;
let categories = [];
let allProducts = [];
let filteredProducts = [];
let cart = JSON.parse(localStorage.getItem('granja-cart') || '[]');
let selectedCategory = null;
let searchQuery = '';
let sortOrder = 'newest';
let adminOrders = [];
let adminMessages = [];
let adminTab = 'productos';
let adminProductForm = null;
let expandedOrderId = null;

const CAT_COLORS = { agricultura: '#d4edda', ganaderia: '#fff3cd', insumos: '#e2c9a0', servicios: '#cce5ff' };
const CAT_EMOJIS = { agricultura: '🌿', ganaderia: '🐄', insumos: '🔧', servicios: '📋' };
const STATUS_LABELS = { recibido: 'Recibido', en_preparacion: 'En preparación', enviado: 'Enviado', entregado: 'Entregado', cancelado: 'Cancelado' };
const PAYMENT_LABELS = { contra_entrega: 'Contra entrega', transferencia: 'Transferencia bancaria', efectivo: 'Efectivo' };

// --- HELPERS ---
function formatPrice(p) { return new Intl.NumberFormat('es-CU', { style: 'currency', currency: 'CUP', minimumFractionDigits: 0 }).format(p); }
function saveCart() { localStorage.setItem('granja-cart', JSON.stringify(cart)); updateCartBadge(); }
function updateCartBadge() {
  const count = cart.reduce((s, i) => s + i.quantity, 0);
  const badge = document.getElementById('cart-badge');
  if (badge) { badge.textContent = count; badge.classList.toggle('hidden', count === 0); }
}
function getCartTotal() { return cart.reduce((s, i) => s + i.price * i.quantity, 0); }

function addToCart(product, qty = 1) {
  const existing = cart.find(i => i.product.id === product.id);
  if (existing) { existing.quantity += qty; } else { cart.push({ product, quantity: qty }); }
  saveCart();
  showToast(qty + 'x ' + product.name + ' agregado al carrito');
}

function removeFromCart(pid) {
  cart = cart.filter(i => i.product.id !== pid);
  saveCart(); renderView();
}

function updateCartQty(pid, qty) {
  if (qty <= 0) { removeFromCart(pid); return; }
  const item = cart.find(i => i.product.id === pid);
  if (item) { item.quantity = qty; saveCart(); renderView(); }
}

// --- TOAST ---
function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = '0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// --- MODAL ---
function openModal(html) {
  const mc = document.getElementById('modal-container');
  if (!mc) return;
  mc.innerHTML = '<div class="modal-overlay" onclick="if(event.target===this)closeModal()"><div class="modal">' + html + '</div></div>';
}
function closeModal() {
  const mc = document.getElementById('modal-container');
  if (mc) mc.innerHTML = '';
}

// --- NAVIGATION ---
function navigate(view, productId) {
  currentView = view;
  selectedProductId = productId || null;
  const menu = document.getElementById('mobile-menu');
  if (menu) menu.classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (view === 'producto' && productId) {
    renderAsyncView();
  } else {
    renderView();
  }
}

function toggleMobileMenu() {
  document.getElementById('mobile-menu').classList.toggle('open');
}

function updateNavActive() {
  document.querySelectorAll('[data-nav]').forEach(a => {
    a.classList.toggle('active', a.dataset.nav === currentView);
  });
}

// --- API ---
async function fetchCategories() {
  const r = await fetch('/api/categories');
  categories = await r.json();
}

async function fetchProducts(params = '') {
  const r = await fetch('/api/products' + (params ? '?' + params : ''));
  allProducts = await r.json();
  return allProducts;
}

async function fetchProduct(id) {
  const r = await fetch('/api/products/' + id);
  return await r.json();
}

// --- RENDER SYNC VIEWS ---
function renderView() {
  const main = document.getElementById('main-content');
  if (!main) return;
  updateNavActive();
  updateCartBadge();
  let html = '';
  switch (currentView) {
    case 'home': html = renderHome(); break;
    case 'tienda': html = renderTienda(); break;
    case 'carrito': html = '<div class="view">' + renderCarrito() + '</div>'; break;
    case 'checkout': html = '<div class="view">' + renderCheckout() + '</div>'; break;
    case 'contacto': html = '<div class="view">' + renderContacto() + '</div>'; break;
    case 'order-success': html = '<div class="view">' + renderOrderSuccess() + '</div>'; break;
    default: html = renderHome();
  }
  main.innerHTML = html;

  // Focus search input in tienda
  if (currentView === 'tienda') {
    const si = document.getElementById('search-input');
    if (si && searchQuery) si.focus();
  }
}

// --- RENDER ASYNC VIEWS ---
async function renderAsyncView() {
  const main = document.getElementById('main-content');
  if (!main) return;
  updateNavActive();
  updateCartBadge();

  // Show loading
  main.innerHTML = '<div class="view" style="text-align:center;padding:80px 20px"><div class="skeleton" style="width:60%;height:32px;margin:0 auto 16px"></div><div class="skeleton" style="width:100%;height:300px;margin-bottom:24px"></div><div class="skeleton" style="width:80%;height:24px"></div></div>';

  if (currentView === 'producto') {
    const html = await renderProducto();
    main.innerHTML = '<div class="view">' + html + '</div>';
  }
}

// --- HOME ---
function renderHome() {
  const featured = allProducts.filter(p => p.featured);
  return `
<div class="view">
  <!-- HERO -->
  <section class="hero">
    <div class="hero-bg"></div>
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <h1>Productos Frescos Directamente de Nuestra Granja</h1>
      <p>La mayor granja de Aguada, Cienfuegos. Calidad, frescura y tradición en cada producto.</p>
      <div class="hero-buttons">
        <button class="btn btn-primary btn-lg" onclick="navigate('tienda')">🛒 Ver Productos</button>
        <button class="btn btn-secondary btn-lg" onclick="navigate('contacto')">📞 Contactar</button>
      </div>
    </div>
  </section>

  <!-- CATEGORIES -->
  <section class="section" style="background:var(--card)">
    <div class="container">
      <h2 class="section-title">Nuestras Categorías</h2>
      <div class="categories-grid">
        ${categories.map(c => `
          <div class="category-card" onclick="selectedCategory='${c.slug}';navigate('tienda')">
            <img src="/images/cat-${c.slug}.png" alt="${esc(c.name)}" loading="lazy">
            <div class="category-card-info">
              <h3>${esc(c.name)}</h3>
              <p class="count">${c._count?.products || 0} productos</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- FEATURED -->
  <section class="section">
    <div class="container">
      <h2 class="section-title">Productos Destacados</h2>
      <div class="featured-scroll">
        ${featured.map(p => renderProductMini(p)).join('')}
      </div>
      <div class="featured-grid">
        ${featured.map(p => renderProductMini(p)).join('')}
      </div>
    </div>
  </section>

  <!-- TESTIMONIALS -->
  <section class="section" style="background:var(--card)">
    <div class="container">
      <h2 class="section-title">Lo Que Dicen Nuestros Clientes</h2>
      <div class="testimonials-grid">
        <div class="testimonial-card">
          <div class="stars">⭐⭐⭐⭐⭐</div>
          <blockquote>"Los productos de la Granja de Aguada son increíbles. Los tomates y la lechuga siempre llegan frescos a mi restaurante. Excelente servicio y puntualidad."</blockquote>
          <div class="author">Carlos Martínez</div>
          <div class="role">Chef - Restaurante La Terraza</div>
        </div>
        <div class="testimonial-card">
          <div class="stars">⭐⭐⭐⭐⭐</div>
          <blockquote>"Desde que compramos en la granja, la calidad de nuestros productos mejoró notablemente. Los clientes lo notan y vuelven. Muy recomendados."</blockquote>
          <div class="author">María López</div>
          <div class="role">Gerente - Mercado Municipal</div>
        </div>
        <div class="testimonial-card">
          <div class="stars">⭐⭐⭐⭐⭐</div>
          <blockquote>"La visita guiada a la granja fue una experiencia fantástica para nuestros huéspedes. Los productos lácteos son de primera calidad. Un tesoro de Cienfuegos."</blockquote>
          <div class="author">Roberto Sánchez</div>
          <div class="role">Director - Hotel Punta Gorda</div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA MAYORISTAS -->
  <section class="cta-mayoristas">
    <h2>¿Es usted distribuidor o comprador mayorista?</h2>
    <p>Ofrecemos precios especiales para pedidos al por mayor. Coordinamos entregas en toda la provincia de Cienfuegos. Consulte nuestras condiciones y precios personalizados.</p>
    <button class="btn btn-secondary btn-lg" onclick="navigate('contacto')">📋 Solicitar Cotización</button>
    <a href="tel:+5343XXXXXXX" class="btn btn-primary btn-lg" style="margin-left:8px">📞 Llamar Ahora</a>
  </section>
</div>`;
}

function renderProductMini(p) {
  const color = CAT_COLORS[p.category?.slug] || '#d4edda';
  const emoji = CAT_EMOJIS[p.category?.slug] || '🌱';
  const productJson = JSON.stringify(p).replace(/</g, '\u003c').replace(/\n/g, ' ');
  return `
    <div class="product-mini">
      <div class="product-mini-img" style="background:${color}">${emoji}</div>
      <div class="product-mini-info">
        <h4 onclick="navigate('producto','${p.id}')">${esc(p.name)}</h4>
        <p class="desc">${esc(p.shortDesc || '')}</p>
        <div class="price">${formatPrice(p.price)} <span>/ ${esc(p.unit)}</span></div>
        <button class="btn-add-cart mt-4" onclick="event.stopPropagation();addToCart(${productJson})" ${p.stock <= 0 ? 'disabled' : ''}>Agregar</button>
      </div>
    </div>`;
}

// --- TIENDA ---
function renderTienda() {
  let products = [...allProducts];
  if (selectedCategory) products = products.filter(p => p.category?.slug === selectedCategory);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
  }
  if (sortOrder === 'price-asc') products.sort((a, b) => a.price - b.price);
  else if (sortOrder === 'price-desc') products.sort((a, b) => b.price - a.price);
  filteredProducts = products;

  return `
<div class="view">
  <div class="container" style="padding-top:32px;padding-bottom:48px">
    <div class="store-header">
      <h1>Nuestra Tienda</h1>
      <div class="search-box">
        <span>🔍</span>
        <input type="text" placeholder="Buscar productos..." value="${esc(searchQuery)}" oninput="searchQuery=this.value;renderView()" id="search-input">
      </div>
    </div>
    <div class="filters-bar">
      <button class="filter-pill ${!selectedCategory ? 'active' : ''}" onclick="selectedCategory=null;renderView()">Todas</button>
      ${categories.map(c => `<button class="filter-pill ${selectedCategory === c.slug ? 'active' : ''}" onclick="selectedCategory='${c.slug}';renderView()">${esc(c.name)}</button>`).join('')}
      <select class="sort-select" onchange="sortOrder=this.value;renderView()">
        <option value="newest" ${sortOrder === 'newest' ? 'selected' : ''}>Más recientes</option>
        <option value="price-asc" ${sortOrder === 'price-asc' ? 'selected' : ''}>Precio: menor a mayor</option>
        <option value="price-desc" ${sortOrder === 'price-desc' ? 'selected' : ''}>Precio: mayor a menor</option>
      </select>
    </div>
    ${products.length === 0 ? '<p class="text-center" style="padding:60px 0;color:var(--text-light)">No se encontraron productos.</p>' :
      '<div class="products-grid">' + products.map(p => renderProductCard(p)).join('') + '</div>'}
  </div>
</div>`;
}

function renderProductCard(p) {
  const color = CAT_COLORS[p.category?.slug] || '#d4edda';
  const emoji = CAT_EMOJIS[p.category?.slug] || '🌱';
  const inStock = p.stock > 0;
  const productJson = JSON.stringify(p).replace(/</g, '\u003c').replace(/\n/g, ' ');
  return `
    <div class="product-card" onclick="navigate('producto','${p.id}')">
      <div class="product-card-img" style="background:${color}">${emoji}</div>
      <div class="product-card-body">
        <h3>${esc(p.name)}</h3>
        <p class="short-desc">${esc(p.shortDesc || '')}</p>
        <div class="price-row">
          <div class="price">${formatPrice(p.price)} <span>/ ${esc(p.unit)}</span></div>
          <span class="stock-badge ${inStock ? 'stock-in' : 'stock-out'}">${inStock ? 'En stock' : 'Agotado'}</span>
        </div>
        <button class="btn-add-cart" style="width:100%;margin-top:12px" onclick="event.stopPropagation();addToCart(${productJson})" ${!inStock ? 'disabled' : ''}>${inStock ? 'Agregar' : 'Agotado'}</button>
      </div>
    </div>`;
}

// --- PRODUCTO DETAIL (ASYNC) ---
async function renderProducto() {
  if (!selectedProductId) return '<div class="container" style="padding:40px"><p>Producto no encontrado.</p><button class="btn btn-primary mt-4" onclick="navigate(\'tienda\')">Volver a la tienda</button></div>';
  try {
    const p = await fetchProduct(selectedProductId);
    if (!p || !p.id) return '<div class="detail-container"><p style="color:var(--text-light)">Producto no encontrado.</p><button class="btn btn-primary mt-4" onclick="navigate(\'tienda\')">Volver a la tienda</button></div>';
    const color = CAT_COLORS[p.category?.slug] || '#d4edda';
    const emoji = CAT_EMOJIS[p.category?.slug] || '🌱';
    const inStock = p.stock > 0;
    const related = allProducts.filter(r => r.category?.slug === p.category?.slug && r.id !== p.id).slice(0, 3);
    const productJson = JSON.stringify(p).replace(/</g, '\u003c').replace(/\n/g, ' ');
    return `
    <div class="detail-container">
      <span class="back-link" onclick="navigate('tienda')">← Volver a la tienda</span>
      <div class="detail-grid">
        <div class="detail-img" style="background:${color}">${emoji}</div>
        <div class="detail-info">
          <div class="detail-badges">
            ${p.category ? '<span class="badge badge-outline">' + esc(p.category.name) + '</span>' : ''}
            <span class="badge ${inStock ? 'badge-green' : 'badge-red'}">${inStock ? 'En stock' : 'Agotado'}</span>
            ${p.featured ? '<span class="badge" style="background:#fff3cd;color:#856404">⭐ Destacado</span>' : ''}
          </div>
          <h1>${esc(p.name)}</h1>
          <div class="detail-price">${formatPrice(p.price)} <span>/ ${esc(p.unit)}</span></div>
          ${p.weight ? '<p style="margin-top:8px;font-size:0.9rem;color:var(--text-light)">Peso aprox.: ' + esc(p.weight) + '</p>' : ''}
          <p class="detail-desc">${esc(p.description)}</p>
          ${inStock ? `
          <div class="qty-selector">
            <span class="label">Cantidad:</span>
            <div class="qty-controls">
              <button class="qty-btn" onclick="detailQtyChange(-1)">−</button>
              <span class="qty-value" id="detail-qty">1</span>
              <button class="qty-btn" onclick="detailQtyChange(1)">+</button>
            </div>
            ${p.stock <= 10 ? '<span style="font-size:0.8rem;color:var(--accent)">Solo ' + p.stock + ' disponibles</span>' : ''}
          </div>
          <div class="detail-actions">
            <button class="btn btn-primary btn-lg" style="flex:1" onclick="addToCart(${productJson}, getDetailQty());navigate('carrito')">🛒 Agregar al Carrito</button>
            <button class="btn btn-accent btn-lg" style="flex:1" onclick="addToCart(${productJson}, getDetailQty());navigate('checkout')">⚡ Comprar Ahora</button>
          </div>` : '<p style="color:var(--danger);font-weight:600;margin-top:16px">Producto agotado actualmente</p>'}
        </div>
      </div>
      ${related.length > 0 ? `
      <section class="mt-8">
        <h2 style="font-size:1.25rem;font-weight:700;color:var(--primary-dark);margin-bottom:20px">Productos Relacionados</h2>
        <div class="products-grid">${related.map(r => renderProductCard(r)).join('')}</div>
      </section>` : ''}
    </div>`;
  } catch (e) {
    return '<div class="detail-container"><p style="color:var(--danger)">Error al cargar producto.</p><button class="btn btn-primary mt-4" onclick="navigate(\'tienda\')">Volver a la tienda</button></div>';
  }
}

window._detailQty = 1;
function detailQtyChange(d) {
  window._detailQty = Math.max(1, window._detailQty + d);
  const el = document.getElementById('detail-qty');
  if (el) el.textContent = window._detailQty;
}
function getDetailQty() { return window._detailQty || 1; }

// --- CARRITO ---
function renderCarrito() {
  if (cart.length === 0) {
    return `<div class="cart-container"><div class="cart-empty"><div style="font-size:4rem;margin-bottom:16px">🛒</div><h2>Tu carrito está vacío</h2><p style="color:var(--text-light);margin-bottom:24px">Explora nuestros productos frescos</p><button class="btn btn-primary" onclick="navigate('tienda')">Ver Productos</button></div></div>`;
  }
  return `
  <div class="cart-container">
    <h1>Carrito de Compras</h1>
    <div class="cart-layout">
      <div>
        ${cart.map(item => {
          const p = item.product;
          const color = CAT_COLORS[p.category?.slug] || '#d4edda';
          const emoji = CAT_EMOJIS[p.category?.slug] || '🌱';
          return `<div class="cart-item">
            <div class="cart-item-img" style="background:${color}">${emoji}</div>
            <div class="cart-item-info">
              <h4 onclick="navigate('producto','${p.id}')">${esc(p.name)}</h4>
              <p class="unit-price">${formatPrice(p.price)} / ${esc(p.unit)}</p>
            </div>
            <div class="cart-item-actions">
              <div class="qty-controls">
                <button class="qty-btn" onclick="updateCartQty('${p.id}',${item.quantity}-1)">−</button>
                <span class="qty-value">${item.quantity}</span>
                <button class="qty-btn" onclick="updateCartQty('${p.id}',${item.quantity}+1)">+</button>
              </div>
            </div>
            <div class="cart-item-total">${formatPrice(p.price * item.quantity)}</div>
            <button class="btn-remove" onclick="removeFromCart('${p.id}')" title="Eliminar">✕</button>
          </div>`;
        }).join('')}
        <button class="btn btn-ghost mt-4" onclick="navigate('tienda')">← Seguir Comprando</button>
      </div>
      <div class="cart-summary">
        <h3>Resumen del Pedido</h3>
        <div class="summary-row"><span>Subtotal (${cart.reduce((s, i) => s + i.quantity, 0)} items)</span><span>${formatPrice(getCartTotal())}</span></div>
        <div class="summary-row"><span>Envío</span><span style="color:var(--success)">A coordinar</span></div>
        <div class="summary-total"><span>Total</span><span>${formatPrice(getCartTotal())}</span></div>
        <div class="cart-links">
          <button class="btn btn-primary btn-lg" style="width:100%" onclick="navigate('checkout')">Proceder al Checkout</button>
        </div>
      </div>
    </div>
  </div>`;
}

// --- CHECKOUT ---
function renderCheckout() {
  if (cart.length === 0) { navigate('carrito'); return ''; }
  return `
  <div class="checkout-container">
    <span class="back-link" onclick="navigate('carrito')">← Volver al Carrito</span>
    <h1>Finalizar Compra</h1>
    <div class="checkout-layout">
      <div>
        <form id="checkout-form" onsubmit="submitOrder(event)">
          <div class="form-group"><label>Nombre completo <span class="required">*</span></label><input class="form-control" id="co-name" required placeholder="Su nombre completo"></div>
          <div class="form-group"><label>Teléfono <span class="required">*</span></label><input class="form-control" id="co-phone" required placeholder="Ej: 55512345" type="tel"></div>
          <div class="form-group"><label>Email (opcional)</label><input class="form-control" id="co-email" type="email" placeholder="su@email.com"></div>
          <div class="form-group"><label>Dirección de entrega <span class="required">*</span></label><input class="form-control" id="co-address" required placeholder="Calle, número, municipio..."></div>
          <div class="form-group"><label>Notas adicionales (opcional)</label><textarea class="form-control" id="co-notes" placeholder="Instrucciones especiales de entrega..."></textarea></div>
          <div class="form-group">
            <label>Método de pago</label>
            <div class="payment-options">
              <label class="payment-option selected" onclick="selectPayment(this,'contra_entrega')"><input type="radio" name="payment" value="contra_entrega" checked> 💵 Contra entrega</label>
              <label class="payment-option" onclick="selectPayment(this,'transferencia')"><input type="radio" name="payment" value="transferencia"> 🏦 Transferencia bancaria</label>
              <label class="payment-option" onclick="selectPayment(this,'efectivo')"><input type="radio" name="payment" value="efectivo"> 💰 Efectivo</label>
            </div>
          </div>
          <div class="terms-check"><input type="checkbox" id="co-terms" required><label for="co-terms">Acepto que al confirmar el pedido, la granja se pondrá en contacto para coordinar los detalles de entrega y pago. *</label></div>
          <button class="btn btn-primary btn-lg mt-4" style="width:100%" type="submit" id="checkout-submit">Confirmar Pedido</button>
        </form>
      </div>
      <div class="cart-summary">
        <h3>Su Pedido</h3>
        ${cart.map(item => `<div class="summary-row"><span>${esc(item.product.name)} × ${item.quantity}</span><span>${formatPrice(item.product.price * item.quantity)}</span></div>`).join('')}
        <div class="summary-total"><span>Total</span><span>${formatPrice(getCartTotal())}</span></div>
      </div>
    </div>
  </div>`;
}

window._selectedPayment = 'contra_entrega';
function selectPayment(el, val) {
  window._selectedPayment = val;
  document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
}

async function submitOrder(e) {
  e.preventDefault();
  const btn = document.getElementById('checkout-submit');
  btn.disabled = true;
  btn.textContent = 'Procesando...';
  try {
    const body = {
      customerName: document.getElementById('co-name').value,
      customerPhone: document.getElementById('co-phone').value,
      customerEmail: document.getElementById('co-email').value || null,
      address: document.getElementById('co-address').value,
      notes: document.getElementById('co-notes').value || null,
      total: getCartTotal(),
      paymentMethod: window._selectedPayment,
      items: cart.map(i => ({ productId: i.product.id, productName: i.product.name, price: i.product.price, quantity: i.quantity, unit: i.product.unit }))
    };
    const r = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const order = await r.json();
    window._lastOrderNumber = order.orderNumber;
    cart = [];
    saveCart();
    window._detailQty = 1;
    navigate('order-success');
  } catch (err) {
    showToast('Error al crear el pedido', 'error');
    btn.disabled = false;
    btn.textContent = 'Confirmar Pedido';
  }
}

function renderOrderSuccess() {
  return `<div class="order-success"><div class="check">✅</div><h2>¡Pedido Confirmado!</h2><p class="order-num">Pedido #${window._lastOrderNumber || ''}</p><p>Nos pondremos en contacto pronto para coordinar la entrega. ¡Gracias por su compra!</p><button class="btn btn-primary btn-lg" onclick="navigate('home')">Volver al Inicio</button></div>`;
}

// --- CONTACTO ---
function renderContacto() {
  return `
  <div class="contact-container">
    <h1>Contáctenos</h1>
    <div class="contact-layout">
      <div class="contact-form">
        <h2>Envíenos un Mensaje</h2>
        <form onsubmit="submitContact(event)">
          <div class="form-group"><label>Nombre <span class="required">*</span></label><input class="form-control" id="ct-name" required placeholder="Su nombre"></div>
          <div class="form-group"><label>Email</label><input class="form-control" id="ct-email" type="email" placeholder="su@email.com"></div>
          <div class="form-group"><label>Teléfono</label><input class="form-control" id="ct-phone" type="tel" placeholder="Su teléfono"></div>
          <div class="form-group"><label>Asunto</label>
            <select class="form-control" id="ct-subject"><option value="">Seleccione un asunto</option><option value="pedido">Consulta sobre pedido</option><option value="mayorista">Pedido mayorista</option><option value="visita">Visita a la granja</option><option value="otro">Otro</option></select>
          </div>
          <div class="form-group"><label>Mensaje <span class="required">*</span></label><textarea class="form-control" id="ct-message" required placeholder="Escriba su mensaje..." rows="5"></textarea></div>
          <button class="btn btn-primary btn-lg" style="width:100%" type="submit">Enviar Mensaje</button>
        </form>
      </div>
      <div class="contact-info">
        <a href="tel:+5343XXXXXXX" class="contact-card"><div class="icon">📞</div><div class="info"><h4>Teléfono</h4><p>+53 43 XXX XXXX</p></div></a>
        <a href="https://wa.me/5343XXXXXXX?text=Hola%2C%20me%20interesa%20conocer%20m%C3%A1s%20sobre%20los%20productos" target="_blank" class="contact-card"><div class="icon">💬</div><div class="info"><h4>WhatsApp</h4><p>Enviar mensaje</p></div></a>
        <a href="mailto:info@granjadeaguada.cu" class="contact-card"><div class="icon">✉️</div><div class="info"><h4>Email</h4><p>info@granjadeaguada.cu</p></div></a>
        <div class="contact-card"><div class="icon">📍</div><div class="info"><h4>Dirección</h4><p>Aguada, Cienfuegos, Cuba</p></div></div>
        <div class="contact-card"><div class="icon">🕐</div><div class="info"><h4>Horario</h4><p>Lunes a Sábado: 7:00 AM - 5:00 PM<br>Domingo: Cerrado</p></div></div>
      </div>
    </div>
  </div>`;
}

async function submitContact(e) {
  e.preventDefault();
  try {
    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: document.getElementById('ct-name').value,
        email: document.getElementById('ct-email').value || null,
        phone: document.getElementById('ct-phone').value || null,
        subject: document.getElementById('ct-subject').value || null,
        message: document.getElementById('ct-message').value
      })
    });
    showToast('¡Mensaje enviado con éxito!');
    e.target.reset();
  } catch (err) {
    showToast('Error al enviar mensaje', 'error');
  }
}

// --- ADMIN ---
function openAdmin() {
  const overlay = document.getElementById('admin-overlay');
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  adminTab = 'productos';
  expandedOrderId = null;
  loadAdminData();
}

function closeAdmin() {
  const overlay = document.getElementById('admin-overlay');
  overlay.classList.add('hidden');
  document.body.style.overflow = '';
  closeModal();
}

function switchAdminTab(tab) {
  adminTab = tab;
  expandedOrderId = null;
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.admin-section').forEach(s => s.classList.toggle('active', s.dataset.section === tab));
}

async function loadAdminData() {
  try {
    const [prods, ords, msgs] = await Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/orders').then(r => r.json()),
      fetch('/api/contact').then(r => r.json())
    ]);
    adminOrders = ords;
    adminMessages = msgs;
    const overlay = document.getElementById('admin-overlay');
    overlay.innerHTML = `
      <div class="admin-header">
        <h2>⚙️ Panel de Administración</h2>
        <div style="display:flex;align-items:center;gap:12px">
          <div class="admin-tabs">
            <button class="admin-tab active" data-tab="productos" onclick="switchAdminTab('productos')">Productos (${prods.length})</button>
            <button class="admin-tab" data-tab="pedidos" onclick="switchAdminTab('pedidos')">Pedidos (${ords.length})</button>
            <button class="admin-tab" data-tab="mensajes" onclick="switchAdminTab('mensajes')">Mensajes (${msgs.length})</button>
          </div>
          <button class="btn btn-ghost" onclick="closeAdmin()" style="font-size:1.3rem;min-width:44px;min-height:44px">✕</button>
        </div>
      </div>
      <div class="admin-body">
        <div class="admin-section active" data-section="productos">${renderAdminProducts(prods)}</div>
        <div class="admin-section" data-section="pedidos">${renderAdminOrders(ords)}</div>
        <div class="admin-section" data-section="mensajes">${renderAdminMessages(msgs)}</div>
      </div>`;
  } catch (err) {
    showToast('Error al cargar datos del admin', 'error');
  }
}

function renderAdminProducts(products) {
  return `<h3 style="display:flex;align-items:center;justify-content:space-between">Productos <button class="btn btn-primary btn-sm" onclick="openProductDialog()">+ Nuevo Producto</button></h3>
    <div style="overflow-x:auto;margin-top:16px"><table class="admin-table"><thead><tr><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
    ${products.map(p => `<tr>
      <td><strong>${esc(p.name)}</strong></td><td>${esc(p.category?.name || '-')}</td><td>${formatPrice(p.price)}/${esc(p.unit)}</td><td>${p.stock}</td>
      <td>${p.active ? '<span class="stock-badge stock-in">Activo</span>' : '<span class="stock-badge stock-out">Inactivo</span>'} ${p.featured ? '⭐' : ''}</td>
      <td class="actions">
        <button class="admin-btn" onclick="toggleFeatured('${p.id}',${!p.featured})" title="${p.featured ? 'Quitar destacado' : 'Destacar'}">⭐</button>
        <button class="admin-btn" onclick="toggleActive('${p.id}',${!p.active})" title="${p.active ? 'Desactivar' : 'Activar'}">${p.active ? '🔴' : '🟢'}</button>
        <button class="admin-btn" onclick="openProductDialog(${JSON.stringify(p).replace(/</g, '\u003c').replace(/"/g, '&quot;')})" title="Editar">✏️</button>
        <button class="admin-btn danger" onclick="deleteProduct('${p.id}')" title="Eliminar">🗑️</button>
      </td></tr>`).join('')}
    </tbody></table></div>`;
}

function renderAdminOrders(orders) {
  if (orders.length === 0) return '<p class="text-center" style="padding:40px;color:var(--text-light)">No hay pedidos.</p>';
  return orders.map(o => {
    const expanded = expandedOrderId === o.id;
    return `<div class="order-card">
      <div class="order-card-header">
        <div class="order-meta">
          <h4>#${esc(o.orderNumber)}</h4>
          <p>${esc(o.customerName)} · ${esc(o.customerPhone)}</p>
          <p style="font-size:0.8rem;color:var(--text-light)">${new Date(o.createdAt).toLocaleDateString('es-CU')} · ${PAYMENT_LABELS[o.paymentMethod] || o.paymentMethod}</p>
        </div>
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <span class="stock-badge stock-in">${STATUS_LABELS[o.status] || o.status}</span>
          <strong style="color:var(--accent)">${formatPrice(o.total)}</strong>
          <button class="btn btn-sm btn-ghost" onclick="toggleOrderExpand('${o.id}')">${expanded ? '▲' : '▼'}</button>
          <button class="btn btn-sm btn-danger" onclick="deleteOrder('${o.id}')">🗑️</button>
        </div>
      </div>
      ${expanded ? `<div style="margin-top:16px">
        ${o.address ? '<p style="font-size:0.9rem;margin-bottom:8px"><strong>Dirección:</strong> ' + esc(o.address) + '</p>' : ''}
        ${o.notes ? '<p style="font-size:0.9rem;margin-bottom:8px"><strong>Notas:</strong> ' + esc(o.notes) + '</p>' : ''}
        <p style="font-size:0.9rem;margin-bottom:8px"><strong>Estado:</strong>
          <select class="status-select" onchange="updateOrderStatus('${o.id}',this.value)">
            ${Object.entries(STATUS_LABELS).map(([k, v]) => `<option value="${k}" ${o.status === k ? 'selected' : ''}>${v}</option>`).join('')}
          </select>
        </p>
        ${o.items && o.items.length ? `<table class="order-items-table"><thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Total</th></tr></thead><tbody>
          ${o.items.map(i => `<tr><td>${esc(i.productName)}</td><td style="text-align:center">${i.quantity} ${esc(i.unit)}</td><td>${formatPrice(i.price)}</td><td><strong>${formatPrice(i.price * i.quantity)}</strong></td></tr>`).join('')}
        </tbody></table>` : ''}
      </div>` : ''}
    </div>`;
  }).join('');
}

function renderAdminMessages(messages) {
  if (messages.length === 0) return '<p class="text-center" style="padding:40px;color:var(--text-light)">No hay mensajes.</p>';
  return messages.map(m => `<div class="msg-card ${m.read ? '' : 'unread'}">
      <div style="display:flex;justify-content:space-between;align-items:start"><div><h4>${esc(m.name)}</h4>${m.subject ? '<span class="stock-badge stock-in" style="margin-top:4px;display:inline-block">' + esc(m.subject) + '</span>' : ''}</div><span class="msg-date">${new Date(m.createdAt).toLocaleDateString('es-CU')}</span></div>
      <p class="msg-text">${esc(m.message)}</p>
      <div style="display:flex;gap:16px;margin-top:8px;font-size:0.8rem;color:var(--text-light)">${m.email ? '<span>' + esc(m.email) + '</span>' : ''}${m.phone ? '<span>' + esc(m.phone) + '</span>' : ''}</div>
    </div>`).join('');
}

// --- ADMIN ACTIONS ---
async function toggleFeatured(id, val) {
  await fetch('/api/products/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ featured: val }) });
  loadAdminData();
  fetchProducts().then(() => renderView());
  showToast('Producto actualizado');
}

async function toggleActive(id, val) {
  await fetch('/api/products/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: val }) });
  loadAdminData();
  fetchProducts().then(() => renderView());
  showToast('Producto actualizado');
}

async function deleteProduct(id) {
  if (!confirm('¿Eliminar este producto?')) return;
  await fetch('/api/products/' + id, { method: 'DELETE' });
  loadAdminData();
  fetchProducts().then(() => renderView());
  showToast('Producto eliminado');
}

async function deleteOrder(id) {
  if (!confirm('¿Eliminar este pedido?')) return;
  await fetch('/api/orders/' + id, { method: 'DELETE' });
  loadAdminData();
  showToast('Pedido eliminado');
}

async function updateOrderStatus(id, status) {
  await fetch('/api/orders/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
  loadAdminData();
  showToast('Estado actualizado');
}

function toggleOrderExpand(id) {
  expandedOrderId = expandedOrderId === id ? null : id;
  loadAdminData();
}

function openProductDialog(product) {
  adminProductForm = product || { name: '', shortDesc: '', description: '', price: '', unit: 'unidad', stock: '', categoryId: categories[0]?.id || '', featured: false, active: true };
  const isEdit = !!product;
  openModal(`
    <h3>${isEdit ? 'Editar' : 'Nuevo'} Producto</h3>
    <form onsubmit="saveProduct(event,'${isEdit ? product.id : ''}')">
      <div class="form-group"><label>Nombre *</label><input class="form-control" id="pf-name" required value="${esc(adminProductForm.name)}"></div>
      <div class="form-group"><label>Descripción corta</label><input class="form-control" id="pf-shortDesc" value="${esc(adminProductForm.shortDesc || '')}"></div>
      <div class="form-group"><label>Descripción completa</label><textarea class="form-control" id="pf-desc" rows="3">${esc(adminProductForm.description || '')}</textarea></div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
        <div class="form-group"><label>Precio *</label><input class="form-control" type="number" id="pf-price" required value="${adminProductForm.price}"></div>
        <div class="form-group"><label>Unidad</label><input class="form-control" id="pf-unit" value="${esc(adminProductForm.unit || '')}"></div>
        <div class="form-group"><label>Stock</label><input class="form-control" type="number" id="pf-stock" value="${adminProductForm.stock}"></div>
      </div>
      <div class="form-group"><label>Categoría</label><select class="form-control" id="pf-cat">${categories.map(c => `<option value="${c.id}" ${adminProductForm.categoryId === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
      <div style="display:flex;gap:24px;margin-top:16px">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="pf-featured" ${adminProductForm.featured ? 'checked' : ''}> Destacado</label>
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="pf-active" ${adminProductForm.active ? 'checked' : ''}> Activo</label>
      </div>
      <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button type="submit" class="btn btn-primary">${isEdit ? 'Actualizar' : 'Crear'}</button></div>
    </form>
  `);
}

async function saveProduct(e, editId) {
  e.preventDefault();
  const data = {
    name: document.getElementById('pf-name').value,
    shortDesc: document.getElementById('pf-shortDesc').value,
    description: document.getElementById('pf-desc').value,
    price: parseFloat(document.getElementById('pf-price').value) || 0,
    unit: document.getElementById('pf-unit').value,
    stock: parseInt(document.getElementById('pf-stock').value) || 0,
    categoryId: document.getElementById('pf-cat').value,
    featured: document.getElementById('pf-featured').checked,
    active: document.getElementById('pf-active').checked,
  };
  if (editId) {
    await fetch('/api/products/' + editId, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  } else {
    await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  }
  closeModal();
  showToast(editId ? 'Producto actualizado' : 'Producto creado');
  loadAdminData();
  fetchProducts().then(() => renderView());
}

// --- UTILITY ---
function esc(s) {
  if (s === null || s === undefined) return '';
  if (typeof s !== 'string') s = String(s);
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// --- INIT ---
async function init() {
  await fetchCategories();
  await fetchProducts();
  window._detailQty = 1;
  renderView();
  updateCartBadge();
}

init();
