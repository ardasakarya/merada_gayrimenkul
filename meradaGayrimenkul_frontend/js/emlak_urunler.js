// =======================
// HEADER YÜKLE
// =======================
function loadHeader() {
  return fetch("/meradaGayrimenkul_frontend/components/header/header.html")
    .then((r) => {
      if (!r.ok) throw new Error("Header yüklenemedi: " + r.status);
      return r.text();
    })
    .then((html) => {
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
    .catch((err) => {
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

// =======================
// FOOTER YÜKLE
// =======================
function loadFooter() {
  return fetch("/meradaGayrimenkul_frontend/components/footer/footer.html")
    .then((r) => {
      if (!r.ok) throw new Error("Footer yüklenemedi: " + r.status);
      return r.text();
    })
    .then((html) => {
      const container = document.getElementById("footer");
      if (!container) {
        console.warn("#footer elementi bulunamadı.");
        return;
      }

      container.innerHTML = html;
      document.dispatchEvent(new Event("footerLoaded"));
    })
    .catch((err) => {
      console.error("Footer yüklenirken hata:", err);
    });
}

// SAYFA YÜKLENDİĞİNDE ÇALIŞTIR
document.addEventListener("DOMContentLoaded", () => {
  loadHeader();
  loadFooter();
  // İlanları başta yükle
  loadProperties();
});

// =======================
// CONFIG
// =======================

const BACKEND = "http://127.0.0.1:5000";
const PAGE_SIZE = 16; // her sayfada 16 ilan
let allProperties = [];
let currentPage = 1;
let activeFilters = {};
let deletePropertyId = null;

// =======================
// UTILITY
// =======================
function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// Fiyat parse + format
function parsePriceToNumber(value) {
  if (value === null || value === undefined || value === "") return null;

  let s = String(value).trim();

  // para birimi, boşluk vs temizle (sadece sayı, nokta, virgül, eksi kalsın)
  s = s.replace(/[^\d.,-]/g, "");

  const hasDot = s.includes(".");
  const hasComma = s.includes(",");

  if (hasDot && hasComma) {
    // 12.345.678,90 -> "." binlik, "," ondalık
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (hasComma && !hasDot) {
    // 123123,00 -> "," ondalık (TR)
    // ama bazen 1,234,567 gibi de gelebilir; basit kontrol:
    const parts = s.split(",");
    if (parts.length === 2 && parts[1].length <= 2) {
      s = parts[0].replace(/\./g, "") + "." + parts[1];
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (hasDot && !hasComma) {
    // 123123.00 -> "." ondalık (backend)  ✅ BİZİM DURUM
    // 12.345.678 -> "." binlik olabilir
    const parts = s.split(".");
    if (parts.length > 2) {
      // 12.345.678 gibi -> binlik
      s = s.replace(/\./g, "");
    } else if (parts.length === 2) {
      // tek nokta varsa:
      // son parça 3 hane ise binlik kabul et (12.345)
      // son parça 1-2 hane ise ondalık kabul et (123.00)
      if (parts[1].length === 3) {
        s = s.replace(/\./g, "");
      }
      // değilse olduğu gibi kalsın (ondalık)
    }
  }

  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function formatPriceTR(value) {
  const n = parsePriceToNumber(value);
  if (n === null) return "-";
  return n.toLocaleString("tr-TR", { maximumFractionDigits: 0 });
}

// =======================
// FİLTRE COMPONENT YÜKLE
// =======================
fetch("/meradaGayrimenkul_frontend/components/filter/filter.html")
  .then((res) => res.text())
  .then((html) => {
    const container = document.getElementById("filterContainer");
    if (!container) return;
    container.innerHTML = html;

    // DOM tamamen otursun
    requestAnimationFrame(() => {
      if (typeof initFilter === "function") {
        initFilter();
      } else {
        console.error("❌ initFilter bulunamadı");
      }
    });
  })
  .catch((err) => console.error("Filter yüklenemedi:", err));

// =======================
// ANA LİSTEYİ YÜKLE
// =======================
async function loadProperties(filters = {}) {
  try {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${BACKEND}/properties?${query}`);
    if (!res.ok) throw new Error("Sunucudan veri alınamadı");
    const data = await res.json();

    allProperties = data || [];
    currentPage = 1;

    renderPropertiesPage(currentPage);
  } catch (err) {
    console.error("İlanlar yüklenemedi:", err);
    alert("İlanlar yüklenemedi: " + err.message);
  }
}

// =======================
// SAYFALAMA + KART RENDER
// =======================

function renderPropertiesPage(page) {
  const grid = document.getElementById("gridView");
  const list = document.getElementById("listView");

  if (!grid || !list) return;

  grid.innerHTML = "";
  list.innerHTML = "";

  if (!allProperties.length) {
    const emptyHtml =
      '<div class="text-center text-gray-500 py-12">Hiç ilan bulunamadı.</div>';
    grid.innerHTML = emptyHtml;
    list.innerHTML = emptyHtml;
    renderPagination();
    return;
  }

  const totalPages = Math.ceil(allProperties.length / PAGE_SIZE);
  currentPage = Math.max(1, Math.min(page, totalPages));

  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageItems = allProperties.slice(start, end);

  pageItems.forEach((prop) => {
    // 🔎 İlan türü (satılık / kiralık) -> badge
    const ltRaw = prop.listing_type ?? prop.status ?? "";
    const lt = String(ltRaw).toLowerCase();
    const isRent = lt.includes("kira"); // "kiralik", "kira", "kiralık" vs.

    const badgeText = isRent ? "Kiralık" : "Satılık";

    const badgeClassGrid =
      "absolute top-3 right-3 z-20 px-4 py-1.5 text-xs sm:text-sm font-bold " +
      "rounded-lg shadow-xl tracking-wide " +
      (isRent
        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white"
        : "bg-gradient-to-r from-green-600 to-green-500 text-white");

    const badgeClassList =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold " +
      (isRent
        ? "bg-blue-100 text-blue-700 border border-blue-200"
        : "bg-green-100 text-green-700 border border-green-200");

    // 💰 Fiyatı formatla
    const rawPrice = prop.price;
    const formattedPrice = formatPriceTR(rawPrice);
    const currencySymbol = "₺";

    console.log("Fiyat:", rawPrice, "->", formattedPrice);

    // ======================
    // 📦 GRID KART (Kutulu)
    // ======================
    const card = document.createElement("div");
    card.className =
      "bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-lg transition-all cursor-pointer";

    const aspect = document.createElement("div");
    aspect.className = "relative";

    const img = document.createElement("img");
    img.src = prop.photo || BACKEND + "/img/placeholder.webp";
    img.alt = prop.title || "photo";
    img.className = "w-full h-48 object-cover object-center";
    aspect.appendChild(img);

    const badgeGrid = document.createElement("div");
    badgeGrid.className = badgeClassGrid;
    badgeGrid.textContent = badgeText;
    aspect.appendChild(badgeGrid);

    const body = document.createElement("div");
    body.className = "p-5";
    body.innerHTML = `
      <div class="text-2xl font-bold text-gray-900 mb-2">
        ${formattedPrice} ${currencySymbol}
      </div>

      <h3 class="text-lg font-semibold text-gray-800 mb-3">
        ${escapeHtml(prop.title || "-")}
      </h3>

      <div class="flex items-center text-gray-500 text-sm mb-4">
        <i class="ri-map-pin-line text-base mr-2"></i>
        <span>${[prop.city, prop.district, prop.neighborhood]
          .filter(Boolean)
          .join(" / ")}</span>
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

    // 🔥 Grid fiyatını DOM üzerinden de zorla set et
    const priceElGrid = body.querySelector(
      ".text-2xl.font-bold.text-gray-900.mb-2"
    );
    if (priceElGrid) {
      priceElGrid.textContent = `${formattedPrice} ${currencySymbol}`;
      console.log("Grid DOM fiyat:", priceElGrid.textContent);
    }

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
          <img src="${
            prop.photo || BACKEND + "/img/placeholder.webp"
          }"
               alt="${escapeHtml(prop.title || "-")}" 
               class="w-full h-full object-cover object-center">
        </div>

        <div class="flex-1 ml-3 overflow-hidden">
          <div class="flex items-center justify-between gap-2">
            <div class="text-sm font-semibold text-gray-800 truncate">
              ${escapeHtml(prop.title || "-")}
            </div>
            <span class="${badgeClassList}">${badgeText}</span>
          </div>

          <div class="flex gap-3 text-xs text-gray-600 mt-1 whitespace-nowrap overflow-hidden overflow-x-auto">
            <span><i class="ri-ruler-line mr-1"></i>${
              prop.net_sqm ?? "-"
            } m²</span>
            <span><i class="ri-map-pin-line mr-1"></i>${
              prop.city || ""
            }</span>
            <span><i class="ri-hotel-bed-line mr-1"></i>${
              prop.rooms ?? "-"
            } Oda</span>
          </div>
        </div>

        <div class="text-sm font-bold text-gray-900 ml-2 whitespace-nowrap">
          ${formattedPrice} ${currencySymbol}
        </div>
      </div>
    `;

    // 🔥 List fiyatını DOM üzerinden de zorla set et
    const priceElList = listCard.querySelector(
      ".text-sm.font-bold.text-gray-900.ml-2.whitespace-nowrap"
    );
    if (priceElList) {
      priceElList.textContent = `${formattedPrice} ${currencySymbol}`;
      console.log("List DOM fiyat:", priceElList.textContent);
    }

    list.appendChild(listCard);
  });

  renderPagination();
}
// =======================
// PAGINATION
// =======================
function renderPagination() {
  const container = document.getElementById("pagination");
  if (!container) return;

  container.innerHTML = "";

  const totalPages = Math.ceil(allProperties.length / PAGE_SIZE);
  if (totalPages <= 1) return;

  const baseBtnClass =
    "px-3 py-1 rounded-md border text-sm mx-0.5 hover:bg-gray-100 transition-colors";

  // Prev
  const prevBtn = document.createElement("button");
  prevBtn.textContent = "‹";
  prevBtn.disabled = currentPage === 1;
  prevBtn.className =
    baseBtnClass + (prevBtn.disabled ? " opacity-50 cursor-default" : "");
  if (!prevBtn.disabled) {
    prevBtn.addEventListener("click", () =>
      renderPropertiesPage(currentPage - 1)
    );
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
    baseBtnClass + (nextBtn.disabled ? " opacity-50 cursor-default" : "");
  if (!nextBtn.disabled) {
    nextBtn.addEventListener("click", () =>
      renderPropertiesPage(currentPage + 1)
    );
  }
  container.appendChild(nextBtn);
}

// =======================
// FİLTRE DROPDOWN
// =======================
function toggleDropdown(id) {
  document.querySelectorAll('ul[id$="Dropdown"]').forEach((el) => {
    if (el.id !== id) el.classList.add("hidden");
  });
  const el = document.getElementById(id);
  if (el) el.classList.toggle("hidden");
}

function selectOption(labelId, value) {
  const labelEl = document.getElementById(labelId);
  if (labelEl) labelEl.innerText = value;
  const dropdownId = labelId.replace("Label", "Dropdown");
  const dropdownEl = document.getElementById(dropdownId);
  if (dropdownEl) dropdownEl.classList.add("hidden");
}

document.addEventListener("click", function (e) {
  const isDropdownButton = e.target
    .closest("button")
    ?.onclick?.toString()
    .includes("toggleDropdown");
  if (!isDropdownButton) {
    document
      .querySelectorAll('ul[id$="Dropdown"]')
      .forEach((el) => el.classList.add("hidden"));
  }
});

// =======================
// TOGGLES (Satılık / Kiralık, Grid / List)
// =======================
document.addEventListener("DOMContentLoaded", function () {
  const saleBtn = document.getElementById("saleBtn");
  const rentBtn = document.getElementById("rentBtn");

  if (saleBtn && rentBtn) {
    saleBtn.addEventListener("click", function () {
      saleBtn.classList.add("bg-brandYellow");
      rentBtn.classList.remove("bg-brandYellow");
    });
    rentBtn.addEventListener("click", function () {
      rentBtn.classList.add("bg-brandYellow");
      saleBtn.classList.remove("bg-brandYellow");
    });
  }

  const gridViewBtn = document.getElementById("gridViewBtn");
  const listViewBtn = document.getElementById("listViewBtn");
  const gridView = document.getElementById("gridView");
  const listView = document.getElementById("listView");

  if (gridViewBtn && listViewBtn && gridView && listView) {
    gridViewBtn.addEventListener("click", function () {
      gridViewBtn.classList.add("bg-brandYellow");
      listViewBtn.classList.remove("bg-brandYellow");
      gridView.classList.remove("hidden");
      listView.classList.add("hidden");
    });

    listViewBtn.addEventListener("click", function () {
      listViewBtn.classList.add("bg-brandYellow");
      gridViewBtn.classList.remove("bg-brandYellow");
      listView.classList.remove("hidden");
      gridView.classList.add("hidden");
    });
  }
});

// =======================
// FİLTRE PANELİ (Mobil)
// =======================
function toggleFilterMenu() {
  const filterMenu = document.getElementById("filterMenu");
  const filterBtn = document.getElementById("filterToggleBtn");
  if (!filterMenu || !filterBtn) return;

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
  if (!adv) return;

  if (adv.classList.contains("hidden")) {
    adv.classList.remove("hidden");
    adv.classList.add("block");
  } else {
    adv.classList.add("hidden");
    adv.classList.remove("block");
  }
}