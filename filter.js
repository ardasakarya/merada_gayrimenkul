// === BU DOSYADA SADECE FONKSİYON TANIMI VAR ===
// === DOM'A ERİŞİM initFilter İÇİNDE ===

function initFilter() {
  console.log("✅ initFilter çalıştı");

  const panel = document.getElementById("filterPanel");
  const toggleBtn = document.getElementById("filterToggle");

  const iconFilter = document.getElementById("iconFilter");
  const iconClose = document.getElementById("iconClose");

  if (!panel || !toggleBtn) {
    console.warn("❌ Filter elemanları bulunamadı");
    return;
  }

  toggleBtn.dataset.open = "false";

  toggleBtn.addEventListener("click", () => {
    const isOpen = toggleBtn.dataset.open === "true";

    if (!isOpen) {
      // PANEL AÇ
      panel.classList.remove("-translate-x-full");

      iconFilter?.classList.add("hidden");
      iconClose?.classList.remove("hidden");

      toggleBtn.dataset.open = "true";
    } else {
      // PANEL KAPA
      panel.classList.add("-translate-x-full");

      iconClose?.classList.add("hidden");
      iconFilter?.classList.remove("hidden");

      toggleBtn.dataset.open = "false";
    }
  });
}

/* ================= ADVANCED ================= */

function toggleAdvanced() {
  const advancedFilters = document.getElementById("advancedFilters");
  advancedFilters?.classList.toggle("hidden");
}

/* ================= APPLY FILTERS ================= */

function applyFilters() {
  const filters = {
    city: "Mersin",
    district: document.getElementById("district")?.value || null,

    usage_status: document.getElementById("usage_status")?.value || null,
    rooms: document.getElementById("rooms")?.value || null,
    price_min: document.getElementById("price_min")?.value || null,
    price_max: document.getElementById("price_max")?.value || null,

    listing_date: document.getElementById("listing_date")?.value || null,
    category: document.getElementById("category")?.value || null,

    gross_sqm: document.getElementById("gross_sqm")?.value || null,
    net_sqm: document.getElementById("net_sqm")?.value || null,

    building_age: document.getElementById("building_age")?.value || null,
    floors: document.getElementById("floors")?.value || null,
    floor_location: document.getElementById("floor_location")?.value || null,

    heating_type: document.getElementById("heating_type")?.value || null,
    facade: document.getElementById("facade")?.value || null,

    central_air: document.getElementById("central_air")?.checked ? 1 : null,
    fireplace: document.getElementById("fireplace")?.checked ? 1 : null,
    smart_home_features: document.getElementById("smart_home")?.checked ? 1 : null,
    walk_in_closet: document.getElementById("walk_in_closet")?.checked ? 1 : null,
    ensuite_bathroom: document.getElementById("ensuite")?.checked ? 1 : null,
    modern_kitchen: document.getElementById("modern_kitchen")?.checked ? 1 : null,

    parking: document.getElementById("parking")?.checked ? 1 : null,
    garage: document.getElementById("garage")?.checked ? 1 : null,
    garden: document.getElementById("garden")?.checked ? 1 : null,
    terrace: document.getElementById("terrace")?.checked ? 1 : null,
    swimming_pool: document.getElementById("swimming_pool")?.checked ? 1 : null,
    playground: document.getElementById("playground")?.checked ? 1 : null,

    sea_view: document.getElementById("sea_view")?.checked ? 1 : null,
    mountain_view: document.getElementById("mountain_view")?.checked ? 1 : null,
    park_nearby: document.getElementById("park_nearby")?.checked ? 1 : null,
    near_school: document.getElementById("near_school")?.checked ? 1 : null,
    near_hospital: document.getElementById("near_hospital")?.checked ? 1 : null,
    near_market: document.getElementById("near_market")?.checked ? 1 : null,
    near_transport: document.getElementById("near_transport")?.checked ? 1 : null,

    loan_status: document.getElementById("loan_status")?.checked ? 1 : null,
    exchange_status: document.getElementById("exchange_status")?.checked ? 1 : null
  };

  console.log("📦 Uygulanan Filtreler:", filters);
fetch("http://localhost:3000/api/properties/filter", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(filters)
})
  .then(res => res.json())
  .then(data => {
    console.log("✅ Gelen ilanlar:", data);

    if (data.error) {
      console.error("❌ Backend error:", data.error);
      return;
    }

    if (typeof renderProperties !== "function") {
      console.error("❌ renderProperties tanımlı değil");
      return;
    }

    renderProperties(data);
  })
  .catch(err => {
    console.error("🔥 Fetch hatası:", err);
  });


}
