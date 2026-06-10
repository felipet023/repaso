/* ============================================
   AGROS — script.js
   Cart, Quiz, Lightbox, Animations
   ============================================ */

// ---- WHATSAPP NUMBER (edita aquí) ----
const WA_NUMBER = "573000000000";

// ---- PRODUCTS DATA ----
const PRODUCTS = [
  {
    id: 1,
    name: "Jabón Equilibrante",
    subtitle: "Piel Mixta",
    benefits: "Hidrata, regula y refresca.",
    use: "Aplicar sobre el rostro húmedo, masajear suavemente y enjuagar con abundante agua.",
    price: 18000,
    img: "https://images.unsplash.com/photo-1600857062241-98e5dba7f474?w=400&q=80",
    tag: "Más vendido"
  },
  {
    id: 2,
    name: "Jabón Hidratación Profunda",
    subtitle: "Piel Seca",
    benefits: "Suaviza, ilumina y mejora textura.",
    use: "Aplicar sobre el rostro húmedo, masajear suavemente y enjuagar con abundante agua.",
    price: 20000,
    img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80",
    tag: "Hidratante"
  },
  {
    id: 3,
    name: "Jabón de Arroz",
    subtitle: "Efecto Matificante",
    benefits: "Efecto matificante y limpieza profunda.",
    use: "Aplicar sobre el rostro húmedo, masajear suavemente y enjuagar con abundante agua.",
    price: 18000,
    img: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&q=80",
    tag: "Matificante"
  },
  {
    id: 4,
    name: "Jabón de Cúrcuma",
    subtitle: "Piel con Acné",
    benefits: "Reduce inflamación y mejora el tono. Ideal para acné y piel sensible.",
    use: "Aplicar sobre el rostro húmedo, masajear suavemente y enjuagar con abundante agua.",
    price: 20000,
    img: "https://images.unsplash.com/photo-1583209814683-c81379e99e53?w=400&q=80",
    tag: "Anti-acné"
  },
  {
    id: 5,
    name: "Jabón Relajante",
    subtitle: "Piel Normal",
    benefits: "Nutre y relaja la piel.",
    use: "Aplicar sobre el rostro húmedo, masajear suavemente y enjuagar con abundante agua.",
    price: 18000,
    img: "https://images.unsplash.com/photo-1643982746536-fba1e8170de2?w=400&q=80",
    tag: "Relajante"
  },
  {
    id: 6,
    name: "Jabón Detox",
    subtitle: "Piel Grasa",
    benefits: "Elimina toxinas y controla grasa.",
    use: "Aplicar sobre el rostro húmedo, masajear suavemente y enjuagar con abundante agua.",
    price: 20000,
    img: "https://images.unsplash.com/photo-1547793548-7a0e81bd8840?w=400&q=80",
    tag: "Detox"
  },
  {
    id: 7,
    name: "Jabón Nutrición Diaria",
    subtitle: "Uso Diario",
    benefits: "Nutre, suaviza y protege.",
    use: "Aplicar sobre el rostro húmedo, masajear suavemente y enjuagar con abundante agua.",
    price: 18000,
    img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80",
    tag: "Nutritivo"
  }
];

// ---- QUIZ DATA ----
const QUIZ = {
  grasa: {
    rec: ["Jabón Detox", "Jabón de Arroz"],
    text: "Para piel grasa recomendamos el Jabón Detox o el Jabón de Arroz. Controlan la grasa y purifican sin resecar.",
    ids: [6, 3]
  },
  seca: {
    rec: ["Jabón Hidratación Profunda"],
    text: "Para piel seca, el Jabón de Hidratación Profunda es ideal. Suaviza y recupera la barrera natural de la piel.",
    ids: [2]
  },
  mixta: {
    rec: ["Jabón Equilibrante"],
    text: "Para piel mixta, el Jabón Equilibrante regula las zonas grasas y nutre las secas al mismo tiempo.",
    ids: [1]
  },
  sensible: {
    rec: ["Jabón de Cúrcuma"],
    text: "Para piel sensible, el Jabón de Cúrcuma reduce la inflamación y calma la piel con ingredientes suaves.",
    ids: [4]
  },
  normal: {
    rec: ["Jabón Relajante", "Jabón Nutrición Diaria"],
    text: "Para piel normal, el Jabón Relajante o de Nutrición Diaria mantienen tu piel sana y radiante.",
    ids: [5, 7]
  }
};

// ---- STATE ----
let cart = [];

// ---- DOM READY ----
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  initCart();
  initQuiz();
  initGallery();
  initFAQ();
  initNavbar();
  initReveal();
  initContactForm();
  initMenuToggle();
});

// ========================================
// RENDER PRODUCTS
// ========================================
function renderProducts() {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;
  grid.innerHTML = PRODUCTS.map((p, i) => `
    <div class="product-card" style="animation-delay:${i * 0.08}s" data-id="${p.id}">
      <div class="product-img-wrap">
        <img src="${p.img}" alt="${p.name}" class="product-img" loading="lazy" />
        <span class="product-tag">${p.tag}</span>
      </div>
      <div class="product-body">
        <h3 class="product-name">${p.name}</h3>
        <p class="product-benefits">${p.benefits}</p>
        <div class="product-use">🌿 <strong>Modo de uso:</strong> ${p.use}</div>
        <div class="product-footer">
          <div class="product-price">
            <span class="price-label">$</span>
            <input
              type="number"
              value="${p.price}"
              min="1000"
              step="1000"
              id="price-${p.id}"
              aria-label="Precio de ${p.name}"
              title="Edita el precio"
            />
          </div>
          <button class="add-btn" onclick="addToCart(${p.id})" id="addBtn-${p.id}">
            + Agregar
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

function getProductPrice(id) {
  const input = document.getElementById(`price-${id}`);
  return input ? parseInt(input.value) || 0 : 0;
}

// ========================================
// CART
// ========================================
function initCart() {
  const cartBtn = document.getElementById("cartBtn");
  const cartClose = document.getElementById("cartClose");
  const cartOverlay = document.getElementById("cartOverlay");
  cartBtn.addEventListener("click", openCart);
  cartClose.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);
}

function openCart() {
  document.getElementById("cartDrawer").classList.add("open");
  document.getElementById("cartOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
  renderCart();
}

function closeCart() {
  document.getElementById("cartDrawer").classList.remove("open");
  document.getElementById("cartOverlay").classList.remove("open");
  document.body.style.overflow = "";
}

function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  const price = getProductPrice(id);
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
    existing.price = price;
  } else {
    cart.push({ ...product, qty: 1, price });
  }
  updateCartCount();
  renderCart();

  // Visual feedback
  const btn = document.getElementById(`addBtn-${id}`);
  if (btn) {
    btn.textContent = "✓ Agregado";
    btn.classList.add("added");
    setTimeout(() => {
      btn.textContent = "+ Agregar";
      btn.classList.remove("added");
    }, 1500);
  }
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  updateCartCount();
  renderCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else { updateCartCount(); renderCart(); }
}

function clearCart() {
  cart = [];
  updateCartCount();
  renderCart();
}

function getTotal() {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

function updateCartCount() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById("cartCount").textContent = count;
}

function renderCart() {
  const itemsEl = document.getElementById("cartItems");
  const footerEl = document.getElementById("cartFooter");

  if (cart.length === 0) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        <span>🛒</span>
        <p>Tu carrito está vacío.</p>
        <p>Agrega un producto para comenzar.</p>
      </div>`;
    footerEl.innerHTML = "";
    return;
  }

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.name}" />
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${(item.price * item.qty).toLocaleString("es-CO")}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${item.id})">✕</button>
    </div>
  `).join("");

  footerEl.innerHTML = `
    <div class="cart-total">
      <span>Total</span>
      <span class="cart-total-amount">$${getTotal().toLocaleString("es-CO")}</span>
    </div>
    <div class="cart-actions">
      <button class="btn-primary" onclick="openOrderModal()">Finalizar Pedido</button>
      <button class="btn-clear" onclick="clearCart()">Vaciar carrito</button>
    </div>
  `;
}

// ========================================
// ORDER MODAL / WHATSAPP
// ========================================
function openOrderModal() {
  document.getElementById("orderModal").classList.add("open");
  document.getElementById("modalOverlay").classList.add("open");
  document.getElementById("sendWhatsapp").addEventListener("click", sendOrder, { once: true });
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalOverlay").addEventListener("click", closeModal);
}

function closeModal() {
  document.getElementById("orderModal").classList.remove("open");
  document.getElementById("modalOverlay").classList.remove("open");
}

function sendOrder() {
  const name = document.getElementById("customerName").value.trim() || "Cliente";
  let msg = `¡Hola AGROS! 🌿 Soy *${name}* y quiero realizar el siguiente pedido:\n\n`;
  cart.forEach(item => {
    msg += `• *${item.name}* x${item.qty} — $${(item.price * item.qty).toLocaleString("es-CO")}\n`;
  });
  msg += `\n*Total: $${getTotal().toLocaleString("es-CO")}*\n\n¿Podrían confirmar disponibilidad? 🙏`;
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
  closeModal();
  closeCart();
}

// ========================================
// QUIZ
// ========================================
function initQuiz() {
  const opts = document.querySelectorAll(".quiz-opt");
  opts.forEach(btn => {
    btn.addEventListener("click", () => {
      opts.forEach(o => o.classList.remove("active"));
      btn.classList.add("active");
      const skin = btn.dataset.skin;
      showQuizResult(skin);
    });
  });
}

function showQuizResult(skin) {
  const data = QUIZ[skin];
  const el = document.getElementById("quizResult");
  if (!data || !el) return;
  el.classList.add("show");
  el.innerHTML = `
    <h4>✨ Recomendamos para ti</h4>
    <p>${data.text}</p>
    <a href="#products" class="btn-primary" onclick="highlightProducts([${data.ids}])">
      Ver productos recomendados
    </a>
  `;
}

function highlightProducts(ids) {
  setTimeout(() => {
    document.querySelectorAll(".product-card").forEach(card => {
      const id = parseInt(card.dataset.id);
      if (ids.includes(id)) {
        card.style.outline = "3px solid var(--green-light)";
        card.style.outlineOffset = "3px";
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => { card.style.outline = ""; card.style.outlineOffset = ""; }, 3000);
      }
    });
  }, 400);
}

// ========================================
// GALLERY / LIGHTBOX
// ========================================
function initGallery() {
  const items = document.querySelectorAll(".gallery-item");
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightboxImg");
  const lbClose = document.getElementById("lightboxClose");

  items.forEach(item => {
    item.addEventListener("click", () => {
      lbImg.src = item.dataset.src;
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
    });
  });

  lbClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });

  function closeLightbox() {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }
}

// ========================================
// FAQ
// ========================================
function initFAQ() {
  document.querySelectorAll(".faq-item").forEach(item => {
    item.querySelector(".faq-q").addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item").forEach(i => i.classList.remove("open"));
      if (!isOpen) item.classList.add("open");
    });
  });
}

// ========================================
// NAVBAR SCROLL
// ========================================
function initNavbar() {
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 40);
  }, { passive: true });
}

// ========================================
// SCROLL REVEAL
// ========================================
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
}

// ========================================
// CONTACT FORM
// ========================================
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;
  form.addEventListener("submit", e => {
    e.preventDefault();
    const btn = form.querySelector("button[type=submit]");
    btn.textContent = "✓ Mensaje enviado";
    btn.style.background = "var(--green-light)";
    setTimeout(() => {
      btn.textContent = "Enviar Mensaje";
      btn.style.background = "";
      form.reset();
    }, 3000);
  });
}

// ========================================
// MOBILE MENU
// ========================================
function initMenuToggle() {
  const toggle = document.getElementById("menuToggle");
  const mobile = document.getElementById("navMobile");
  toggle.addEventListener("click", () => {
    mobile.classList.toggle("open");
  });
  // Close menu when a link is clicked
  mobile.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => mobile.classList.remove("open"));
  });
}
