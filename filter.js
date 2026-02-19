const API_BASE = "http://localhost:3000";
const el = (id) => document.getElementById(id);

function togglePanel(forceOpen) {
  const panel = el("filterPanel");
  const btn = el("filterToggle");
  const iconFilter = el("iconFilter");
  const iconClose = el("iconClose");
  if (!panel || !btn) return;

  const isOpen = typeof forceOpen === "boolean" ? forceOpen : btn.dataset.open !== "true";

  if (isOpen) {
    panel.classList.remove("-translate-x-full");
    iconFilter?.classList.add("hidden");
    iconClose?.classList.remove("hidden");
    btn.dataset.open = "true";
  } else {
    panel.classList.add("-translate-x-full");
    iconClose?.classList.add("hidden");
    iconFilter?.classList.remove("hidden");
    btn.dataset.open = "false";
  }
}

function toggleAdvanced() {
  el("advancedFilters")?.classList.toggle("hidden");
}

function cleanStr(v) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s : null;
}
function cleanNum(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function collectFeatureGroups() {
  const groups = { transport: [], view: [], exterior: [], env: [], access: [], interior: [], facade: [], housing: [] };

  document.querySelectorAll('input[type="checkbox"][data-group][data-key]').forEach((cb) => {
    if (!cb.checked) return;
    const g = cb.getAttribute("data-group");
    const k = cb.getAttribute("data-key");
    if (groups[g]) groups[g].push(k);
  });

  return groups;
}

function getFilters() {
  const groups = collectFeatureGroups();

  return {
    city: cleanStr(el("city")?.value) || "Mersin",
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

    features: groups
  };
}

function resetUI() {
  const setVal = (id, v = "") => { if (el(id)) el(id).value = v; };
  const setChk = (id, v = false) => { if (el(id)) el(id).checked = v; };

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

  ["loan_status","exchange_status","balcony","furnished"].forEach(id => setChk(id,false));

  document.querySelectorAll('input[type="checkbox"][data-group][data-key]').forEach(cb => cb.checked = false);
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatPrice(price, currency = "₺") {
  const n = Number(price);
  if (!Number.isFinite(n)) return "";
  return currency + n.toLocaleString("tr-TR");
}

/**
 * Eğer sayfanda zaten renderProperties() varsa onu kullanır.
 * Yoksa bu script kendi kartlarını basar.
 */
function fallbackRender(list) {
  const grid = el("grid");
  if (!grid) return;

  grid.innerHTML = "";

  if (!Array.isArray(list) || list.length === 0) {
    grid.innerHTML = `<div class="col-span-full bg-white border rounded-2xl p-6 text-center text-gray-600">Sonuç bulunamadı.</div>`;
    return;
  }

  for (const p of list) {
    const title = escapeHtml(p.title || "İlan");
    const city = escapeHtml(p.city || "");
    const district = escapeHtml(p.district || "");
    const rooms = escapeHtml(p.rooms || "");
    
    const img = p.cover_photo ? escapeHtml(p.cover_photo) : "";

    grid.insertAdjacentHTML("beforeend", `
      <div class="bg-white border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition">
        ${img ? `<img src="${img}" class="w-full h-44 object-cover">` : `<div class="w-full h-44 bg-gray-100"></div>`}
        <div class="p-5 space-y-2">
          <div class="flex items-center justify-between">
           
            <span class="text-xs text-gray-500 font-semibold">${rooms}</span>
          </div>
          <h3 class="text-lg font-extrabold text-gray-900">${title}</h3>
          <div class="text-sm text-gray-600">${district ? district + " / " : ""}${city}</div>
          <div class="pt-2 text-xl font-black text-gray-900">${formatPrice(p.price, p.currency || "₺")}</div>
          <p class="text-sm text-gray-600 line-clamp-2">${escapeHtml(p.description || "")}</p>
        </div>
      </div>
    `);
  }
}

async function applyFilters() {
  const payload = getFilters();

  try {
    const res = await fetch(`${API_BASE}/api/properties/filter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("❌ Backend error:", data);
      return;
    }

    // Eğer senin sayfanda renderProperties fonksiyonu varsa onu kullan
    if (typeof window.renderProperties === "function") {
      window.renderProperties(data);
    } else {
      fallbackRender(data);
    }

    togglePanel(false);
  } catch (err) {
    console.error("🔥 Fetch hatası:", err);
  }
}

function wireEvents() {
  // Bu elementler bazı sayfalarda yoksa hata vermesin diye ?.
  el("filterToggle")?.addEventListener("click", () => togglePanel());
  el("closePanelBtn")?.addEventListener("click", () => togglePanel(false));
  el("toggleAdvancedBtn")?.addEventListener("click", toggleAdvanced);

  el("applyBtn")?.addEventListener("click", applyFilters);
  el("resetBtn")?.addEventListener("click", () => {
    resetUI();
  });
}

/**
 * ✅ emlak_urunler.js bunu bekliyor.
 * Global’e yazıyoruz.
 */
function initFilter() {
  // panel/btn yoksa sayfada filtre yoktur, sessizce çık
  if (!el("filterPanel") || !el("filterToggle")) return;

  wireEvents();

  // Sayfa ilk açıldığında ilanları getir
  applyFilters();
}

// global yap
window.initFilter = initFilter;

// Eğer başka bir dosya çağırmazsa bile otomatik çalışsın:
document.addEventListener("DOMContentLoaded", () => {
  // sayfada filtre HTML'i varsa otomatik init
  if (el("filterPanel") && el("filterToggle")) {
    initFilter();
  }
});
