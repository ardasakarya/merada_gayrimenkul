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
// === CONFIG ===

const BACKEND = "http://127.0.0.1:5000";
const PAGE_SIZE = 16;          // 🔥 her sayfada 16 ilan
let allProperties = [];        // tüm ilanlar burada tutulacak
let currentPage = 1;           // seçili sayfa
let activeFilters = {};        // aktif filtreler
let deletePropertyId = null;// aktif filtreler tutulacak

// === UTILITY ===
function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

fetch("filter.html")
  .then(res => res.text())
  .then(html => {
    const container = document.getElementById("filterContainer");
    container.innerHTML = html;

    // 🔥 DOM'un gerçekten oturmasını bekle
    requestAnimationFrame(() => {
      if (typeof initFilter === "function") {
        initFilter();
      } else {
        console.error("❌ initFilter bulunamadı");
      }
    });
  })
  .catch(err => console.error("Filter yüklenemedi:", err));



// === ANA LİSTEYİ YÜKLE ===
// === ANA LİSTEYİ YÜKLE ===
async function loadProperties(filters = {}) {
  try {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${BACKEND}/properties?${query}`);
    if (!res.ok) throw new Error("Sunucudan veri alınamadı");
    const data = await res.json();

    allProperties = data || [];
    currentPage = 1; // filtre değişirse başa dön

    renderPropertiesPage(currentPage);
  } catch (err) {
    console.error("İlanlar yüklenemedi:", err);
    alert("İlanlar yüklenemedi: " + err.message);
  }
}

function renderPropertiesPage(page) {
  const grid = document.getElementById("gridView");
  const list = document.getElementById("listView");

  if (!grid || !list) return;

  grid.innerHTML = "";
  list.innerHTML = "";

  if (!allProperties.length) {
    const emptyHtml = `<div class="text-center text-gray-500 py-12">Hiç ilan bulunamadı.</div>`;
    grid.innerHTML = emptyHtml;
    list.innerHTML = emptyHtml;
    renderPagination(); // boşken de pagination'ı temizle
    return;
  }

  const totalPages = Math.ceil(allProperties.length / PAGE_SIZE);
  currentPage = Math.max(1, Math.min(page, totalPages));

  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageItems = allProperties.slice(start, end);

  pageItems.forEach(prop => {
    // ======================
    // 📦 GRID KART (Kutulu)
    // ======================
    const card = document.createElement("div");
    card.className =
      "bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-lg transition-all cursor-pointer";

    const aspect = document.createElement("div");
    aspect.className = "relative";
    const img = document.createElement("img");
    img.src = prop.photo || (BACKEND + "/img/placeholder.webp");
    img.alt = prop.title || "photo";
    img.className = "w-full h-48 object-cover object-center";
    aspect.appendChild(img);

    if (prop.status) {
      const badge = document.createElement("div");
      badge.className =
        "absolute top-3 left-3 bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow";
      badge.textContent = prop.status;
      aspect.appendChild(badge);
    }

    const body = document.createElement("div");
    body.className = "p-5";
    body.innerHTML = `
      <div class="text-2xl font-bold text-gray-900 mb-2">
        ${prop.currency ?? ""}${prop.price ?? "-"} 
      </div>
      <h3 class="text-lg font-semibold text-gray-800 mb-3">${escapeHtml(prop.title || "-")}</h3>
      <div class="flex items-center text-gray-500 text-sm mb-4">
        <i class="ri-map-pin-line text-base mr-2"></i>
        <span>${[prop.city, prop.district, prop.neighborhood].filter(Boolean).join(" / ")}</span>
      </div>
      <div class="flex items-center justify-between text-gray-600 text-sm">
        <div class="flex items-center gap-1">
          <i class="ri-hotel-bed-line text-indigo-600 text-lg"></i>
          <span>${prop.rooms ?? "-"} Oda</span>
        </div>
        <div class="flex items-center gap-1">
          <i class="ri-drop-line text-indigo-600 text-lg"></i>
          <span>${prop.bathrooms ?? "-"} Banyo</span>
        </div>
        <div class="flex items-center gap-1">
          <i class="ri-ruler-line text-indigo-600 text-lg"></i>
          <span>${prop.net_sqm ?? "-"} m²</span>
        </div>
      </div>
    `;

    card.appendChild(aspect);
    card.appendChild(body);
    card.addEventListener("click", () => {
      window.location.href = `emlak_detay.html?id=${prop.id}`;
    });
    grid.appendChild(card);

    // ======================
    // 📋 LİSTE KART (Satırlı)
    // ======================
    const listCard = document.createElement("a");
    listCard.href = `emlak_detay.html?id=${prop.id}`;
    listCard.className = "block";

    listCard.innerHTML = `
      <div class="flex items-center bg-white rounded-lg shadow-sm border px-3 py-2 h-20 hover:shadow-md transition-all">
        <div class="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
          <img src="${prop.photo || (BACKEND + "/img/placeholder.webp")}"
               alt="${escapeHtml(prop.title || "-")}" 
               class="w-full h-full object-cover object-center">
        </div>
        <div class="flex-1 ml-3 overflow-hidden">
          <div class="text-sm font-semibold text-gray-800 truncate">${escapeHtml(prop.title || "-")}</div>
          <div class="flex gap-3 text-xs text-gray-600 mt-1 whitespace-nowrap overflow-hidden overflow-x-auto">
            <span><i class="ri-ruler-line mr-1"></i>${prop.net_sqm ?? "-"} m²</span>
            <span><i class="ri-map-pin-line mr-1"></i>${prop.city || ""}</span>
            <span><i class="ri-hotel-bed-line mr-1"></i>${prop.rooms ?? "-"} Oda</span>
          </div>
        </div>
        <div class="text-sm font-bold text-gray-900 ml-2 whitespace-nowrap">
          ${prop.currency ?? ""}${prop.price ?? "-"}
        </div>
      </div>
    `;

    list.appendChild(listCard);
  });

  renderPagination();
}

function renderPagination() {
  const container = document.getElementById("pagination");
  if (!container) return;

  container.innerHTML = "";

  const totalPages = Math.ceil(allProperties.length / PAGE_SIZE);
  if (totalPages <= 1) return; // tek sayfa, buton gösterme

  const baseBtnClass =
    "px-3 py-1 rounded-md border text-sm mx-0.5 hover:bg-gray-100 transition-colors";

  // Prev
  const prevBtn = document.createElement("button");
  prevBtn.textContent = "‹";
  prevBtn.disabled = currentPage === 1;
  prevBtn.className =
    baseBtnClass +
    (prevBtn.disabled
      ? " opacity-50 cursor-default"
      : "");
  if (!prevBtn.disabled) {
    prevBtn.addEventListener("click", () => renderPropertiesPage(currentPage - 1));
  }
  container.appendChild(prevBtn);

  // Sayfa numaraları
  for (let p = 1; p <= totalPages; p++) {
    const btn = document.createElement("button");
    btn.textContent = p;
    btn.className =
      baseBtnClass +
      (p === currentPage
        ? " bg-brandYellow text-white border-brandYellow"
        : " bg-white text-gray-700");
    btn.addEventListener("click", () => renderPropertiesPage(p));
    container.appendChild(btn);
  }

  // Next
  const nextBtn = document.createElement("button");
  nextBtn.textContent = "›";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.className =
    baseBtnClass +
    (nextBtn.disabled
      ? " opacity-50 cursor-default"
      : "");
  if (!nextBtn.disabled) {
    nextBtn.addEventListener("click", () => renderPropertiesPage(currentPage + 1));
  }
  container.appendChild(nextBtn);
}

// === FİLTRE ===
function toggleDropdown(id) {
  document.querySelectorAll('ul[id$="Dropdown"]').forEach(el => {
    if (el.id !== id) el.classList.add('hidden');
  });
  document.getElementById(id).classList.toggle('hidden');
}

function selectOption(labelId, value) {
  document.getElementById(labelId).innerText = value;
  const dropdownId = labelId.replace("Label", "Dropdown");
  document.getElementById(dropdownId).classList.add("hidden");
}

document.addEventListener('click', function (e) {
  const isDropdownButton = e.target.closest('button')?.onclick?.toString().includes('toggleDropdown');
  if (!isDropdownButton) {
    document.querySelectorAll('ul[id$="Dropdown"]').forEach(el => el.classList.add('hidden'));
  }
});






// === TOGGLES ===
document.addEventListener('DOMContentLoaded', function () {
  const saleBtn = document.getElementById('saleBtn');
  const rentBtn = document.getElementById('rentBtn');

  if (saleBtn && rentBtn) {
    saleBtn.addEventListener('click', function () {
      saleBtn.classList.add('bg-brandYellow');
      rentBtn.classList.remove('bg-brandYellow');
    });
    rentBtn.addEventListener('click', function () {
      rentBtn.classList.add('bg-brandYellow');
      saleBtn.classList.remove('bg-brandYellow');
    });
  }

  // Görünüm toggle
  const gridViewBtn = document.getElementById('gridViewBtn');
  const listViewBtn = document.getElementById('listViewBtn');
  const gridView = document.getElementById('gridView');
  const listView = document.getElementById('listView');

  if (gridViewBtn && listViewBtn && gridView && listView) {
    gridViewBtn.addEventListener('click', function () {
      gridViewBtn.classList.add('bg-brandYellow');
      listViewBtn.classList.remove('bg-brandYellow');
      gridView.classList.remove('hidden');
      listView.classList.add('hidden');
    });

    listViewBtn.addEventListener('click', function () {
      listViewBtn.classList.add('bg-brandYellow');
      gridViewBtn.classList.remove('bg-brandYellow');
      listView.classList.remove('hidden');
      gridView.classList.add('hidden');
    });
  }

  // Sayfa yüklendiğinde ilanları getir
  loadProperties();
});

// === FİLTRE PANELİ (Mobil) ===
function toggleFilterMenu() {
  const filterMenu = document.getElementById("filterMenu");
  const filterBtn = document.getElementById("filterToggleBtn");
  const menuWidth = filterMenu.offsetWidth;

  if (!filterMenu.classList.contains("-translate-x-full")) {
    filterMenu.classList.add("-translate-x-full");
    filterBtn.style.transform = `translate(0, -50%)`;
  } else {
    filterMenu.classList.remove("-translate-x-full");
    filterBtn.style.transform = `translate(${menuWidth}px, -50%)`;
  }
}
function toggleAdvancedFilters() {
    const adv = document.getElementById("advancedFilters");
    if (adv.classList.contains("hidden")) {
        adv.classList.remove("hidden");
        adv.classList.add("block");
    } else {
        adv.classList.add("hidden");
        adv.classList.remove("block");
    }
}


