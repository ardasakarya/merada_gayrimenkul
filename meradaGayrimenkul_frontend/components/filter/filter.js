const API_BASE = `${window.location.protocol}//${window.location.hostname}:5000`;
const IMAGE_BASE = `${window.location.protocol}//${window.location.hostname}:5000/uploads`;

const el = (id) => document.getElementById(id);

function cleanStr(v) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

function cleanNum(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function togglePanel(forceOpen) {
  const panel = el("filterPanel");
  const btn = el("filterToggle");
  if (!panel || !btn) return;

  const iconFilter = el("iconFilter");
  const iconClose = el("iconClose");
  const isOpen = typeof forceOpen === "boolean" ? forceOpen : btn.dataset.open !== "true";

  panel.classList.toggle("-translate-x-full", !isOpen);

  if (isOpen) {
    // Panel genişliği kadar sağa taşı (responsive)
    const panelRect = panel.getBoundingClientRect();
    const panelWidth = panelRect.width;

    // Butonun genişliği ve ekran genişliği
    const btnRect = btn.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    // Ekranın dışına çıkmasın diye max left'i sınırla (16px margin bırakalım)
    const maxLeft = viewportWidth - btnRect.width - 16;
    const newLeft = Math.min(panelWidth, maxLeft);

    btn.style.left = `${newLeft}px`;
  } else {
    // Kapanınca eski haline dön (left-4 class'ı çalışsın)
    btn.style.left = "";
  }

  iconFilter?.classList.toggle("hidden", isOpen);
  iconClose?.classList.toggle("hidden", !isOpen);
  btn.dataset.open = isOpen ? "true" : "false";
}

function toggleAdvanced() {
  el("advancedFilters")?.classList.toggle("hidden");
}

function collectFeatures() {
  const groups = {
    transport: [],
    view: [],
    exterior: [],
    env: [],
    access: []
  };

  document.querySelectorAll('input[type="checkbox"][data-group][data-key]').forEach((cb) => {
    if (!cb.checked) return;
    const g = cb.getAttribute("data-group");
    const k = cb.getAttribute("data-key");
    if (groups[g]) groups[g].push(k);
  });

  return groups;
}

function getFilters() {
  return {
    city: cleanStr(el("city")?.value),
    district: cleanStr(el("district")?.value),
    rooms: cleanStr(el("rooms")?.value),
    price_min: cleanNum(el("price_min")?.value),
    price_max: cleanNum(el("price_max")?.value),
    listing_date: cleanStr(el("listing_date")?.value),
    gross_sqm_min: cleanNum(el("gross_sqm_min")?.value),
    net_sqm_min: cleanNum(el("net_sqm_min")?.value),
    building_age_max: cleanNum(el("building_age_max")?.value),
    floors: cleanNum(el("floors")?.value),
    floor_location: cleanStr(el("floor_location")?.value),
    heating_type: cleanStr(el("heating_type")?.value),
    loan_status: el("loan_status")?.checked ? 1 : null,
    exchange_status: el("exchange_status")?.checked ? 1 : null,
    balcony: el("balcony")?.checked ? 1 : null,
    furnished: el("furnished")?.checked ? 1 : null,
    features: collectFeatures()
  };
}

function resetUI() {
  const setVal = (id, v = "") => { if (el(id)) el(id).value = v; };
  const setChk = (id, v = false) => { if (el(id)) el(id).checked = v; };

  setVal("city", "Mersin");
  setVal("district");
  setVal("rooms");
  setVal("price_min");
  setVal("price_max");
  setVal("listing_date");
  setVal("gross_sqm_min");
  setVal("net_sqm_min");
  setVal("building_age_max");
  setVal("floors");
  setVal("floor_location");
  setVal("heating_type");

  ["loan_status", "exchange_status", "balcony", "furnished"].forEach((id) => setChk(id, false));
  document.querySelectorAll('input[type="checkbox"][data-group][data-key]').forEach((cb) => {
    cb.checked = false;
  });
}

function renderMainCardsFallback(list) {
  const grid = el("gridView") || el("grid");
  const listView = el("listView");
  if (!grid) return;

  grid.innerHTML = "";
  if (listView) listView.innerHTML = "";

  if (!Array.isArray(list) || list.length === 0) {
    grid.innerHTML = '<div class="text-center text-gray-500 py-12 col-span-full">Hiç ilan bulunamadı.</div>';
    if (listView) listView.innerHTML = '<div class="text-center text-gray-500 py-12">Hiç ilan bulunamadı.</div>';
    return;
  }

 list.forEach((prop) => {
  const rawPhoto = prop.cover_photo || prop.photo;

  // Varsayılan placeholder
  let imageUrl = "img/placeholder.png";

  if (rawPhoto) {
    if (/^https?:\/\//i.test(rawPhoto)) {
      // Zaten tam URL ise
      imageUrl = rawPhoto;
    } else {
      // Sadece dosya adı geldiyse: 5000/uploads/... formatına çevir
      const cleaned = String(rawPhoto).replace(/^\/+/, ""); // baştaki /'leri temizle
      imageUrl = `${IMAGE_BASE}/${cleaned}`;
    }
  }

  const card = document.createElement("div");
  card.className = "bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-lg transition-all cursor-pointer";
  card.innerHTML = `
      <div class="relative">
        <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(prop.title || "photo")}" class="w-full h-48 object-cover object-center">
      </div>
      <div class="p-5">
        <div class="text-2xl font-bold text-gray-900 mb-2">${escapeHtml(prop.currency ?? "")}${escapeHtml(prop.price ?? "-")}</div>
        <h3 class="text-lg font-semibold text-gray-800 mb-3">${escapeHtml(prop.title || "-")}</h3>
        <div class="flex items-center text-gray-500 text-sm mb-4">
          <i class="ri-map-pin-line text-base mr-2"></i>
          <span>${[prop.city, prop.district, prop.neighborhood].filter(Boolean).map(escapeHtml).join(" / ")}</span>
        </div>
      </div>
    `;
  card.addEventListener("click", () => {
    window.location.href = `emlak_detay.html?id=${prop.id}`;
  });
  grid.appendChild(card);

  if (listView) {
    const row = document.createElement("a");
    row.href = `emlak_detay.html?id=${prop.id}`;
    row.className = "block";
    row.innerHTML = `
        <div class="flex items-center bg-white rounded-lg shadow-sm border px-3 py-2 h-20 hover:shadow-md transition-all">
          <div class="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
            <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(prop.title || "-")}" class="w-full h-full object-cover object-center">
          </div>
          <div class="flex-1 ml-3 overflow-hidden">
            <div class="text-sm font-semibold text-gray-800 truncate">${escapeHtml(prop.title || "-")}</div>
            <div class="flex gap-3 text-xs text-gray-600 mt-1 whitespace-nowrap overflow-hidden overflow-x-auto">
              <span><i class="ri-ruler-line mr-1"></i>${escapeHtml(prop.net_sqm ?? "-")} m²</span>
              <span><i class="ri-map-pin-line mr-1"></i>${escapeHtml(prop.city || "")}</span>
              <span><i class="ri-hotel-bed-line mr-1"></i>${escapeHtml(prop.rooms ?? "-")} Oda</span>
            </div>
          </div>
          <div class="text-sm font-bold text-gray-900 ml-2 whitespace-nowrap">${escapeHtml(prop.currency ?? "")}${escapeHtml(prop.price ?? "-")}</div>
        </div>
      `;
    listView.appendChild(row);
  }
});

}

function renderResults(data) {
  if (typeof window.renderProperties === "function") {
    window.renderProperties(data);
    return;
  }

  renderMainCardsFallback(data);
}

async function applyFilters() {
  const payload = getFilters();

  try {
    const res = await fetch(`${API_BASE}/api/properties/filter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Backend hatası:", data);
      return;
    }

    renderResults(data);
    togglePanel(false);
  } catch (err) {
    console.error("Fetch hatası:", err);
  }
}

function wireEvents() {
  el("filterToggle")?.addEventListener("click", () => togglePanel());
  el("closePanelBtn")?.addEventListener("click", () => togglePanel(false));
  el("toggleAdvancedBtn")?.addEventListener("click", toggleAdvanced);

  el("applyBtn")?.addEventListener("click", applyFilters);

  el("resetBtn")?.addEventListener("click", () => {
    resetUI();
    applyFilters();
  });
}

function initFilter() {
  if (!el("filterPanel") || !el("filterToggle")) return;
  wireEvents();
  applyFilters();
}

window.initFilter = initFilter;

document.addEventListener("DOMContentLoaded", () => {
  if (el("filterPanel") && el("filterToggle")) {
    initFilter();
  }
});
