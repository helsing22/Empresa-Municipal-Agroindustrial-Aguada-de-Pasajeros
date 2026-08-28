'use client';

import Script from 'next/script';

const htmlShell = `
<div id="app">
  <!-- HEADER -->
  <header id="header">
    <div class="header-inner">
      <button id="mobile-menu-btn" aria-label="Menú" onclick="toggleMobileMenu()">☰</button>
      <div class="logo" onclick="navigate('home')">🌿 Granja de Aguada</div>
      <nav id="main-nav">
        <a data-nav="home" onclick="navigate('home')">Inicio</a>
        <a data-nav="tienda" onclick="navigate('tienda')">Tienda</a>
        <a data-nav="contacto" onclick="navigate('contacto')">Contacto</a>
      </nav>
      <div class="header-actions">
        <button class="btn-icon btn-admin" onclick="openAdmin()" title="Administración">⚙️</button>
        <button class="btn-icon" onclick="navigate('carrito')" title="Carrito">
          🛒 <span id="cart-badge" class="hidden">0</span>
        </button>
      </div>
    </div>
  </header>

  <!-- MOBILE MENU -->
  <div id="mobile-menu">
    <a data-nav="home" onclick="navigate('home')">🏠 Inicio</a>
    <a data-nav="tienda" onclick="navigate('tienda')">🛍️ Tienda</a>
    <a data-nav="contacto" onclick="navigate('contacto')">📞 Contacto</a>
    <a onclick="openAdmin()">⚙️ Administración</a>
  </div>

  <!-- MAIN -->
  <main id="main-content"></main>

  <!-- FOOTER -->
  <footer id="footer">
    <div class="footer-grid">
      <div class="footer-about">
        <h3>🌿 Granja de Aguada</h3>
        <p>La mayor granja de Aguada, Cienfuegos. Productos agrícolas y ganaderos frescos, directamente del campo a su mesa. Tradición, calidad y confianza desde generaciones.</p>
      </div>
      <div class="footer-links">
        <h4>Enlaces Rápidos</h4>
        <a onclick="navigate('home')">Inicio</a>
        <a onclick="navigate('tienda')">Tienda</a>
        <a onclick="navigate('contacto')">Contacto</a>
      </div>
      <div class="footer-contact">
        <h4>Contacto</h4>
        <a href="tel:+5343XXXXXXX">📞 +53 43 XXX XXXX</a>
        <a href="https://wa.me/5343XXXXXXX?text=Hola%2C%20me%20interesa%20conocer%20m%C3%A1s%20sobre%20los%20productos%20de%20la%20Granja%20de%20Aguada" target="_blank" rel="noopener">💬 WhatsApp</a>
        <a href="mailto:info@granjadeaguada.cu">✉️ info@granjadeaguada.cu</a>
        <p>📍 Aguada, Cienfuegos, Cuba</p>
        <p>🕐 Lun-Sáb: 7:00 AM - 5:00 PM</p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; ${new Date().getFullYear()} Granja de Aguada. Todos los derechos reservados.</p>
    </div>
  </footer>

  <!-- WHATSAPP FLOAT -->
  <a href="https://wa.me/5343XXXXXXX?text=Hola%2C%20me%20interesa%20conocer%20m%C3%A1s%20sobre%20los%20productos%20de%20la%20Granja%20de%20Aguada" target="_blank" rel="noopener" class="whatsapp-float" aria-label="WhatsApp">💬</a>

  <!-- ADMIN OVERLAY -->
  <div id="admin-overlay" class="admin-overlay hidden"></div>

  <!-- TOAST CONTAINER -->
  <div id="toast-container" class="toast-container"></div>

  <!-- MODAL CONTAINER -->
  <div id="modal-container"></div>
</div>
`;

export default function Home() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: htmlShell }} />
      <Script src="/app.js" strategy="afterInteractive" />
    </>
  );
}
