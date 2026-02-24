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

const BACKEND_URL = "http://127.0.0.1:5000";

let currentIndex = 0;
let photos = [];

/* -----------------------------
   SAFE DOM HELPERS
------------------------------ */
function setText(id, text) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text ?? "";
}

function setSrc(id, src) {
  const el = document.getElementById(id);
  if (!el) return;
  el.src = src ?? "";
}

function getPropertyIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

/* -----------------------------
   GALLERY
------------------------------ */
function renderGallery(data) {
  photos = Array.isArray(data.photos) ? data.photos : [];
  if (photos.length === 0) return;

  const mainImage = document.getElementById("mainImage");
  if (mainImage) {
    mainImage.src = photos[0];
    mainImage.onclick = () => openGalleryPopup(0);
  }

  const mobileGallery = document.getElementById("mobile_gallery");
  if (mobileGallery) {
    mobileGallery.innerHTML = "";
    photos.forEach((url, idx) => {
      const img = document.createElement("img");
      img.src = url;
      img.className = "h-72 min-w-full object-cover rounded-lg cursor-pointer";
      img.onclick = () => openGalleryPopup(idx);
      mobileGallery.appendChild(img);
    });
  }

  const desktopGallery = document.getElementById("desktop_gallery");
  if (desktopGallery) {
    desktopGallery.innerHTML = "";
    photos.forEach((url, idx) => {
      if (idx < 3) {
        const img = document.createElement("img");
        img.src = url;
        img.className =
          "gallery-thumb w-full h-32 object-cover rounded cursor-pointer hover:opacity-90";
        img.onclick = () => openGalleryPopup(idx);
        desktopGallery.appendChild(img);
      } else if (idx === 3) {
        if (photos.length === 4) {
          const img = document.createElement("img");
          img.src = url;
          img.className =
            "gallery-thumb w-full h-32 object-cover rounded cursor-pointer hover:opacity-90";
          img.onclick = () => openGalleryPopup(idx);
          desktopGallery.appendChild(img);
        } else {
          const wrapper = document.createElement("div");
          wrapper.className =
            "gallery-thumb relative w-full h-32 rounded cursor-pointer hover:opacity-90";
          wrapper.onclick = () => openGalleryPopup(idx);

          const img = document.createElement("img");
          img.src = url;
          img.className = "w-full h-32 object-cover rounded";

          const overlay = document.createElement("div");
          overlay.className =
            "absolute inset-0 bg-black/60 flex items-center justify-center rounded";

          const span = document.createElement("span");
          span.className = "text-white text-xl font-bold";
          const extraCount = photos.length - 4;
          span.textContent = `+${extraCount}`;

          overlay.appendChild(span);
          wrapper.appendChild(img);
          wrapper.appendChild(overlay);
          desktopGallery.appendChild(wrapper);
        }
      }
    });
  }
}

function openGalleryPopup(startIndex = 0) {
  if (!photos || photos.length === 0) return;
  currentIndex = startIndex;

  const popup = document.getElementById("galleryPopup");
  if (!popup) return;
  popup.classList.remove("hidden");

  showSliderImage();
  renderThumbnails();
}

function closeGalleryPopup() {
  const popup = document.getElementById("galleryPopup");
  if (!popup) return;
  popup.classList.add("hidden");
}

function showSliderImage() {
  const sliderImg = document.getElementById("sliderImage");
  if (sliderImg) sliderImg.src = photos[currentIndex];
  highlightThumbnail();
}

function prevImage() {
  currentIndex = (currentIndex - 1 + photos.length) % photos.length;
  showSliderImage();
}

function nextImage() {
  currentIndex = (currentIndex + 1) % photos.length;
  showSliderImage();
}

function renderThumbnails() {
  const container = document.getElementById("sliderThumbnails");
  if (!container) return;

  container.innerHTML = "";
  photos.forEach((photo, index) => {
    const thumb = document.createElement("img");
    thumb.src = photo;
    thumb.className =
      "w-20 h-20 object-cover rounded cursor-pointer border-2 transition hover:opacity-80";
    thumb.onclick = () => {
      currentIndex = index;
      showSliderImage();
    };
    container.appendChild(thumb);
  });

  highlightThumbnail();
}

function highlightThumbnail() {
  const thumbs = document.querySelectorAll("#sliderThumbnails img");
  thumbs.forEach((t, i) => {
    t.classList.remove("border-brandYellow");
    if (i === currentIndex) t.classList.add("border-brandYellow");
  });
}

/* -----------------------------
   FEATURES: 1 => siyah, 0 => gri
   (metin her zaman yazacak)
------------------------------ */
function paintFeature(id, isOn) {
  const el = document.getElementById(id);
  if (!el) return;

  // ilk metni "etiket" olarak sakla (sonradan bozulmasın)
  if (!el.dataset.label) {
    el.dataset.label = (el.textContent || "").trim();
  }

  // her zaman etiketi yaz
  el.textContent = el.dataset.label;

  // renk
  el.classList.remove("text-gray-900", "text-gray-400", "opacity-60");
  if (isOn) {
    el.classList.add("text-gray-900");
  } else {
    el.classList.add("text-gray-400", "opacity-60");
  }
}

function paintGroup(obj, ids) {
  // obj yoksa hepsini 0 gibi boya
  ids.forEach((id) => {
    const v = obj?.[id];
    const isOn = v === 1 || v === true;
    paintFeature(id, isOn);
  });
}

/* -----------------------------
   MAP
------------------------------ */
function renderMap(loc) {
  const mapEl = document.getElementById("property_map");
  if (!mapEl) return;

  if (loc?.latitude && loc?.longitude) {
    const lat = parseFloat(loc.latitude);
    const lng = parseFloat(loc.longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      const zoom = 16;
      const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed&center=${lat},${lng}&markers=${lat},${lng}`;
      mapEl.src = embedUrl;
      mapEl.style.display = "";

      const latInput = document.getElementById("latitude");
      const lngInput = document.getElementById("longitude");
      if (latInput) latInput.value = lat;
      if (lngInput) lngInput.value = lng;
      return;
    }
  }

  mapEl.style.display = "none";
}

/* -----------------------------
   MAIN FETCH (tek fetch)
------------------------------ */
async function loadDetail(propertyId) {
  const res = await fetch(`${BACKEND_URL}/properties/${propertyId}`);
  if (!res.ok) throw new Error("API hatası");
  const data = await res.json();
  console.log("DETAY DATA:", data);

  // Fotoğrafları absolute URL yap
  
  // Galeri bas
  renderGallery(data);

  // Tarih formatlama
  const dateStr = data?.specifications?.listing_date;
  let formattedDate = "-";
  if (dateStr) {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      formattedDate = date.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  }

  // Başlık / fiyat / açıklama
  setText("property_title", data.title || "");
  const priceNum = Number(String(data.price ?? "").replace(/\D/g, "")) || 0;
  setText(
    "property_price",
    `${data.currency ?? "₺"} ${priceNum.toLocaleString("tr-TR")}`
  );
  setText("property_description", data.description || "");

  // Specifications
  setText("listing_date", formattedDate);
  setText("gross_m2", data?.specifications?.gross_sqm ? `${data.specifications.gross_sqm} m²` : "-");
  setText("net_m2", data?.specifications?.net_sqm ? `${data.specifications.net_sqm} m²` : "-");
  setText("rooms", data?.specifications?.rooms ?? "-");
  setText("bathrooms", data?.specifications?.bathrooms ?? "-");
  setText("building_age", data?.specifications?.building_age ?? "-");
  setText("building_floors", data?.specifications?.floors ?? "-");
  setText("floor", data?.specifications?.floor_location ?? "-");
  setText("heating", data?.specifications?.heating_type ?? "-");

  // Agent photo (backend’de photo yoktu; default bas)
  setSrc("agent_photo", "../backend/img/merada_zemin_siyah_logo.png");

  // Location map
  renderMap(data.location);

  /* -----------------------------
     FEATURES OBJ’LERİ (backend ile uyumlu)
  ------------------------------ */
  const interior = data.interior_features || {};
  const exterior = data.exterior_features || {};
  const env = data.environmental_features || {};
  const transport = data.transportation || {}; // ✅ backend: transportation
  const views = data.views || {};
  const accessibility = data.accessibility || {};
  const housingType = data.housingType || {};
  const facade = data.facade || {};         // ✅ backend: views

  // Eğer senin HTML’de bu id’ler varsa, otomatik renklendirir:
  const interiorIds = [
    "wifi", "adsl", "fiber", "smart_home", "alarm_burglar", "alarm_fire", "steel_door",
    "american_door", "wood_joinery", "aluminum_joinery", "pvc_joinery", "parquet",
    "laminate_floor", "ceramic_floor", "marley", "painted", "wallpaper", "cornice",
    "built_in_kitchen", "laminate_kitchen", "set_top_stove", "built_in_oven",
    "natural_gas_kitchen", "washing_machine", "dryer", "dishwasher", "refrigerator",
    "white_goods", "shower_cabin", "bathtub", "turkish_wc", "hilton_bathroom",
    "ensuite_bathroom", "water_heater", "thermosiphon", "spot_lighting",
    "air_conditioning", "dressing_room", "built_in_closet", "pantry", "jacuzzi",
    "fireplace", "terrace", "video_intercom", "intercom_system", "biometric_system"
  ];

  const exteriorIds = [
    "ev_charging_station",
    "security_24h",
    "janitor",
    "steam_room",
    "playground",
    "hammam",
    "hydrofor",
    "thermal_insulation",
    "generator",
    "cable_tv",
    "camera_system",
    "nursery",
    "open_pool",
    "indoor_pool",
    "private_pool",
    "sauna",
    "sound_insulation",
    "siding",
    "sports_area",
    "water_tank",
    "tennis_court",
    "satellite",
    "fire_escape"
  ];

  const envIds = [
    "shopping_mall", "municipality", "mosque", "cemevi", "seafront", "pharmacy",
    "entertainment_center", "fair", "lakefront", "hospital", "synagogue", "primary_school",
    "fire_station", "church", "high_school", "market", "park", "beach", "police_station",
    "health_center", "street_market", "gym", "city_center", "university"
  ];

  const transportIds = [
    "main_road", "avenue", "dolmus", "e5", "airport", "marmaray", "metro", "metrobus",
    "minibus", "bus_stop", "coast", "tem", "train_station", "tram"
  ];

  const viewIds = ["bosporus", "sea", "nature", "lake", "pool", "river", "park", "city"];

  const accessibilityIds = [
    "accessible_parking",
    "accessible_kitchen",
    "wide_corridor",
    "accessible_wc",
    "accessible_elevator",
    "accessible_bathroom",
    "ramp",
    "handrails"
  ];

  const housingTypeIds = [
    "duplex",
    "top_floor",
    "middle_floor",
    "garden_duplex",
    "roof_duplex",
    "reverse_duplex",
    "triplex"
  ];

  const facadeIds = ["west", "east", "south", "north"];

  // ✅ Boya: 1 siyah, 0 gri (metin hep yazacak)
  paintGroup(interior, interiorIds);
  paintGroup(exterior, exteriorIds);
  paintGroup(env, envIds);
  paintGroup(transport, transportIds);
  paintGroup(views, viewIds);
  paintGroup(accessibility, accessibilityIds);
  paintGroup(housingType, housingTypeIds);
  paintGroup(facade, facadeIds);
}

/* -----------------------------
   INIT
------------------------------ */
document.addEventListener("DOMContentLoaded", async () => {
  const id = getPropertyIdFromUrl();
  if (!id) {
    console.error("URL'de id parametresi yok!");
    return;
  }

  try {
    await loadDetail(id);
  } catch (err) {
    console.error("❌ Veri çekme hatası:", err);
  }
});

// Popup butonların HTML'den çağırması için global bırak
window.openGalleryPopup = openGalleryPopup;
window.closeGalleryPopup = closeGalleryPopup;
window.prevImage = prevImage;
window.nextImage = nextImage;
