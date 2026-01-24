const panel = document.getElementById("filterPanel");
const toggleBtn = document.getElementById("filterToggle");

const iconFilter = document.getElementById("iconFilter");
const iconClose = document.getElementById("iconClose");

toggleBtn.addEventListener("click", () => {
  const isOpen = toggleBtn.dataset.open === "true";

  if (!isOpen) {
    // PANEL AÇ
    panel.classList.remove("-translate-x-full");

    // ICON DEĞİŞ
    iconFilter.classList.add("hidden");
    iconClose.classList.remove("hidden");

    // BUTON KONUMU (panelle birlikte kayma varsa)
    toggleBtn.style.left = panel.offsetWidth + "px";
    toggleBtn.classList.replace("rounded-r-xl", "rounded-l-xl");

    toggleBtn.dataset.open = "true";
  } else {
    // PANEL KAPA
    panel.classList.add("-translate-x-full");

    // ICON GERİ AL
    iconClose.classList.add("hidden");
    iconFilter.classList.remove("hidden");

    toggleBtn.style.left = "0px";
    toggleBtn.classList.replace("rounded-l-xl", "rounded-r-xl");

    toggleBtn.dataset.open = "false";
  }
});

function toggleFilter(){
  filterPanel.classList.toggle('-translate-x-full')
}
function toggleAdvanced(){
  advancedFilters.classList.toggle('hidden')
}
function applyFilters() {
  const filters = {

    /* ================= KONUM ================= */
    city: "Mersin",
    district: district.value || null,
    

    /* ================= ANA ================= */
    usage_status: usage_status.value || null,
    rooms: rooms.value || null,
    price_min: price_min.value || null,
    price_max: price_max.value || null,

    /* ================= İLAN ================= */
    listing_date: listing_date.value || null,
    category: category.value || null,

    /* ================= METREKARE ================= */
    gross_sqm: gross_sqm.value || null,
    net_sqm: net_sqm.value || null,

    /* ================= BİNA ================= */
    building_age: building_age.value || null,
    floors: floors.value || null,
    floor_location: floor_location.value || null,

    /* ================= ISINMA / CEPHE ================= */
    heating_type: heating_type.value || null,
    facade: facade.value || null,

    /* ================= İÇ ÖZELLİKLER ================= */
    central_air: central_air.checked ? 1 : null,
    fireplace: fireplace.checked ? 1 : null,
    smart_home_features: smart_home.checked ? 1 : null,
    walk_in_closet: walk_in_closet.checked ? 1 : null,
    ensuite_bathroom: ensuite.checked ? 1 : null,
    modern_kitchen: modern_kitchen.checked ? 1 : null,

    /* ================= DIŞ ÖZELLİKLER ================= */
    parking: parking.checked ? 1 : null,
    garage: garage.checked ? 1 : null,
    garden: garden.checked ? 1 : null,
    terrace: terrace.checked ? 1 : null,
    swimming_pool: swimming_pool.checked ? 1 : null,
    playground: playground.checked ? 1 : null,

    /* ================= ÇEVRE ================= */
    sea_view: sea_view.checked ? 1 : null,
    mountain_view: mountain_view.checked ? 1 : null,
    park_nearby: park_nearby.checked ? 1 : null,
    near_school: near_school.checked ? 1 : null,
    near_hospital: near_hospital.checked ? 1 : null,
    near_market: near_market.checked ? 1 : null,
    near_transport: near_transport.checked ? 1 : null,

    /* ================= DURUM / FİNANS ================= */
    usage_empty: usage_empty.checked ? 1 : null,
    loan_status: loan_status.checked ? 1 : null,
    exchange_status: exchange_status.checked ? 1 : null
  }

  console.log("Uygulanan Filtreler:", filters)

  // örnek backend gönderimi
  // fetch('/api/properties', { method:'POST', body: JSON.stringify(filters) })
}

