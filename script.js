// HEADER YÜKLE
function loadHeader() {
  return fetch("./components/header/header.html")
    .then(r => {
      if (!r.ok) throw new Error("Header yüklenemedi: " + r.status);
      return r.text();
    })
    .then(html => {
      const container = document.getElementById("header");
      if (!container) {
        console.warn("#header elementi bulunamadı.");
        return;
      }

      container.innerHTML = html;

      // Header HTML'i yerleştikten SONRA event bağla
      initHeaderMenu();

      document.dispatchEvent(new Event("headerLoaded"));
    })
    .catch(err => {
      console.error("Header yüklenirken hata:", err);
    });
}

function initHeaderMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");

  if (!menuToggle || !mobileMenu) {
    console.warn("Hamburger menü elemanları bulunamadı.");
    return;
  }

  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });
}

// FOOTER YÜKLE (istersen footer component de aynı mantık)
function loadFooter() {
  return fetch("./components/footer/footer.html")
    .then(r => {
      if (!r.ok) throw new Error("Footer yüklenemedi: " + r.status);
      return r.text();
    })
    .then(html => {
      const container = document.getElementById("footer");
      if (!container) {
        console.warn("#footer elementi bulunamadı.");
        return;
      }

      container.innerHTML = html;
      document.dispatchEvent(new Event("footerLoaded"));
    })
    .catch(err => {
      console.error("Footer yüklenirken hata:", err);
    });
}

// SAYFA YÜKLENDİĞİNDE ÇALIŞTIR
document.addEventListener("DOMContentLoaded", () => {
  loadHeader();
  loadFooter();
});