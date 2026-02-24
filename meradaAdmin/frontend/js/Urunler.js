const BACKEND = "http://127.0.0.1:5000";
let deletePropertyId = null;

const FIELD_LABELS_TR = {
  title: "Başlık",
  description: "Açıklama",
  price: "Fiyat",
  currency: "Para Birimi",
  city: "İl",
  district: "İlçe",
  neighborhood: "Mahalle",
  street: "Sokak",
  street_address: "Açık Adres",
  zip_code: "Posta Kodu",
  latitude: "Enlem",
  longitude: "Boylam",
  listing_date: "İlan Tarihi",
  rooms: "Oda Sayısı",
  bathrooms: "Banyo Sayısı",
  gross_sqm: "Brüt m²",
  net_sqm: "Net m²",
  building_age: "Bina Yaşı",
  floors: "Kat Sayısı",
  floor_location: "Bulunduğu Kat",
  heating_type: "Isıtma Tipi",
  name: "Danışman Adı",
  phone: "Danışman Telefon",
  email: "Danışman E-posta",

  // interior
  adsl: "ADSL",
  wood_joinery: "Ahşap Doğrama",
  smart_home: "Akıllı Ev",
  alarm_burglar: "Hırsız Alarmı",
  alarm_fire: "Yangın Alarmı",
  turkish_wc: "Alaturka WC",
  aluminum_joinery: "Alüminyum Doğrama",
  american_door: "Amerikan Kapı",
  built_in_oven: "Ankastre Fırın",
  barbecue: "Barbekü",
  white_goods: "Beyaz Eşya",
  painted: "Boyalı",
  dishwasher: "Bulaşık Makinesi",
  refrigerator: "Buzdolabı",
  dryer: "Kurutma Makinesi",
  washing_machine: "Çamaşır Makinesi",
  laundry_room: "Çamaşır Odası",
  steel_door: "Çelik Kapı",
  shower_cabin: "Duşakabin",
  wallpaper: "Duvar Kâğıdı",
  ensuite_bathroom: "Ebeveyn Banyosu",
  fiber: "Fiber İnternet",
  dressing_room: "Giyinme Odası",
  built_in_closet: "Gömme Dolap",
  video_intercom: "Görüntülü Diafon",
  hilton_bathroom: "Hilton Banyo",
  intercom_system: "Diafon",
  double_glazing: "Isıcam",
  jacuzzi: "Jakuzi",
  cornice: "Kartonpiyer",
  pantry: "Kiler",
  air_conditioning: "Klima",
  bathtub: "Küvet",
  laminate_floor: "Laminat Zemin",
  marley: "Marley",
  furnished: "Eşyalı",
  built_in_kitchen: "Ankastre Mutfak",
  natural_gas_kitchen: "Mutfakta Doğalgaz",
  shutter: "Panjur",
  parquet: "Parke",
  pvc_joinery: "PVC Doğrama",
  ceramic_floor: "Seramik Zemin",
  set_top_stove: "Set Üstü Ocak",
  spot_lighting: "Spot Aydınlatma",
  water_heater: "Şofben",
  fireplace: "Şömine",
  terrace: "Teras",
  vestiaire: "Vestiyer",
  wifi: "Wi-Fi",
  biometric_system: "Biyometrik Sistem",

  // exterior
  ev_charging_station: "Elektrikli Araç Şarj İstasyonu",
  security_24h: "7/24 Güvenlik",
  janitor: "Kapıcı",
  steam_room: "Buhar Odası",
  playground: "Çocuk Oyun Alanı",
  hammam: "Hamam",
  hydrofor: "Hidrofor",
  thermal_insulation: "Isı Yalıtımı",
  generator: "Jeneratör",
  cable_tv: "Kablo TV",
  camera_system: "Kamera Sistemi",
  nursery: "Kreş",
  open_pool: "Açık Havuz",
  indoor_pool: "Kapalı Havuz",
  sauna: "Sauna",
  sound_insulation: "Ses Yalıtımı",
  siding: "Siding",
  sports_area: "Spor Alanı",
  water_tank: "Su Deposu",
  tennis_court: "Tenis Kortu",
  satellite: "Uydu",
  fire_escape: "Yangın Merdiveni",

  // environmental + transportation + views + accessibility + housing/facade
  shopping_mall: "AVM",
  municipality: "Belediye",
  mosque: "Cami",
  cemevi: "Cemevi",
  seafront: "Denize Sıfır",
  pharmacy: "Eczane",
  entertainment_center: "Eğlence Merkezi",
  fair: "Fuar",
  lakefront: "Göl Kenarı",
  hospital: "Hastane",
  synagogue: "Havra",
  primary_school: "İlkokul",
  fire_station: "İtfaiye",
  church: "Kilise",
  high_school: "Lise",
  market: "Market",
  park: "Park",
  beach: "Plaj",
  police_station: "Polis Merkezi",
  health_center: "Sağlık Ocağı",
  street_market: "Semt Pazarı",
  gym: "Spor Salonu",
  city_center: "Şehir Merkezi",
  university: "Üniversite",
  main_road: "Ana Yola Yakın",
  avenue: "Cadde",
  dolmus: "Dolmuş",
  e5: "E-5",
  airport: "Havalimanı",
  marmaray: "Marmaray",
  metro: "Metro",
  metrobus: "Metrobüs",
  minibus: "Minibüs",
  bus_stop: "Otobüs Durağı",
  coast: "Sahil",
  tem: "TEM",
  train_station: "Tren Garı",
  tram: "Tramvay",
  bosporus: "Boğaz",
  sea: "Deniz",
  nature: "Doğa",
  lake: "Göl",
  pool: "Havuz",
  river: "Nehir",
  accessible_parking: "Engelli Otoparkı",
  accessible_kitchen: "Engelliye Uygun Mutfak",
  wide_corridor: "Geniş Koridor",
  accessible_wc: "Engelli WC",
  accessible_elevator: "Engelli Asansörü",
  accessible_bathroom: "Engelli Banyosu",
  ramp: "Rampa",
  handrails: "Tutunma Barları",
  duplex: "Dubleks",
  top_floor: "Çatı Katı",
  middle_floor: "Ara Kat",
  garden_duplex: "Bahçe Dubleksi",
  roof_duplex: "Çatı Dubleksi",
  reverse_duplex: "Ters Dubleks",
  triplex: "Tripleks",
  west: "Batı Cephe",
  east: "Doğu Cephe",
  south: "Güney Cephe",
  north: "Kuzey Cephe",
};

function getTurkishLabel(key) {
  return FIELD_LABELS_TR[key] || key.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}


function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toBool(v) {
  return v === 1 || v === true || v === "1" || v === "true" || v === "on";
}

function toNumberOrNull(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function parsePhotosText(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);
}

async function loadProperties() {
  try {
    const res = await fetch(`${BACKEND}/properties`);
    if (!res.ok) throw new Error("Sunucudan veri alınamadı");

    const data = await res.json();
    const grid = document.getElementById("propertyGrid");
    grid.innerHTML = "";

    data.forEach((prop) => {
      const card = document.createElement("div");
      card.className = "bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-lg transition-all cursor-pointer";

      const aspect = document.createElement("div");
      aspect.className = "relative";

      const img = document.createElement("img");
      img.src = prop.photo || `${BACKEND}/img/placeholder.webp`;
      img.alt = prop.title || "photo";
      img.className = "w-full h-48 object-cover object-center";
      aspect.appendChild(img);

      const body = document.createElement("div");
      body.className = "p-5";
      body.innerHTML = `
        <div class="text-2xl font-bold text-gray-900 mb-2">
          ${Number(String(prop.price).replace(/\D/g, "") || 0).toLocaleString("tr-TR")} ${prop.currency ?? "₺"}
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
            <span>${prop.gross_sqm ?? "-"} m²</span>
          </div>
        </div>
      `;

      const actions = document.createElement("div");
      actions.className = "flex gap-2 mt-4";

      const editBtn = document.createElement("button");
      editBtn.className = "btn btn-edit";
      editBtn.innerHTML = '<i class="ri-edit-line"></i> Düzenle';
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openEditModal(prop.id);
      });

      const delBtn = document.createElement("button");
      delBtn.className = "btn btn-delete";
      delBtn.innerHTML = '<i class="ri-delete-bin-line"></i> Sil';
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        showDeleteModal(prop.id, prop.title);
      });

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);
      body.appendChild(actions);

      card.appendChild(aspect);
      card.appendChild(body);

      card.addEventListener("click", () => {
        window.location.href = `emlak_detay.html?id=${prop.id}`;
      });

      grid.appendChild(card);
    });
  } catch (err) {
    console.error("İlanlar yüklenemedi:", err);
    alert("İlanlar yüklenemedi: " + err.message);
  }
}

function showDeleteModal(id, propertyName) {
  deletePropertyId = id;
  document.getElementById("propertyName").textContent = propertyName || "";
  document.getElementById("deleteModal").classList.remove("hidden");
}

function hideDeleteModal() {
  deletePropertyId = null;
  document.getElementById("deleteModal").classList.add("hidden");
}

function closeEditModal() {
  document.getElementById("editModal").classList.add("hidden");
}

function buildField(name, label, value, type = "text") {
  const inputBase = "w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brandYellow";
  return `
    <label class="block">
      <div class="text-sm font-medium text-gray-700 mb-1">${escapeHtml(label)}</div>
      <input class="${inputBase}" name="${escapeHtml(name)}" type="${type}" value="${escapeHtml(value ?? "")}">
    </label>
  `;
}

function buildTextarea(name, label, value) {
  const inputBase = "w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brandYellow";
  return `
    <label class="block">
      <div class="text-sm font-medium text-gray-700 mb-1">${escapeHtml(label)}</div>
      <textarea class="${inputBase} min-h-[120px]" name="${escapeHtml(name)}">${escapeHtml(value ?? "")}</textarea>
    </label>
  `;
}

function buildCheckbox(name, label, checked) {
  return `
    <label class="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50">
      <input type="checkbox" class="h-5 w-5" name="${escapeHtml(name)}" ${checked ? "checked" : ""}>
      <span class="text-sm text-gray-800">${escapeHtml(label)}</span>
    </label>
  `;
}

function buildSection(title, inner) {
  return `
    <div class="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5">
      <div class="text-base font-semibold text-gray-900 mb-4">${escapeHtml(title)}</div>
      ${inner}
    </div>
  `;
}

function renderGroup(groupName, title, obj, numberKeys = new Set()) {
  const keys = Object.keys(obj || {}).sort((a, b) => a.localeCompare(b, "tr"));
  if (!keys.length) return "";

  const boolExists = keys.some((k) => typeof obj[k] === "boolean" || obj[k] === 0 || obj[k] === 1);
  const inputs = keys
    .map((k) => {
      const v = obj[k];
      const fieldName = `${groupName}__${k}`;
      const label = getTurkishLabel(k);

      if (typeof v === "boolean" || v === 0 || v === 1) {
        return buildCheckbox(fieldName, label, toBool(v));
      }

      if (k === "listing_date") return buildField(fieldName, label, v, "date");
      if (numberKeys.has(k)) return buildField(fieldName, label, v, "number");
      return buildField(fieldName, label, v, "text");
    })
    .join("");

  const gridClass = boolExists
    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    : "grid grid-cols-1 md:grid-cols-2 gap-4";

  return buildSection(title, `<div class="${gridClass}">${inputs}</div>`);
}

async function openEditModal(id) {
  try {
    const res = await fetch(`${BACKEND}/properties/${id}`);
    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data?.error || "Veri alınamadı");
    }

    const location = data.location || {};
    const spec = data.specifications || {};
    const agent = data.agent || {};
    const photos = Array.isArray(data.photos) ? data.photos : [];

    const interior = data.interior_features || {};
    const exterior = data.exterior_features || {};
    const environmental = data.environmental_features || {};
    const transportation = data.transportation || {};
    const views = data.views || {};
    const accessibility = data.accessibility || {};
    const housingType = data.housingType || {};
    const facade = data.facade || {};

    const numberKeys = new Set([
      "price", "bathrooms", "gross_sqm", "net_sqm", "latitude", "longitude", "building_age", "floors"
    ]);

    const boolKeys = [];
    const collectBoolKeys = (group, obj) => {
      for (const [key, value] of Object.entries(obj || {})) {
        if (typeof value === "boolean" || value === 0 || value === 1) {
          boolKeys.push({ group, key });
        }
      }
    };

    collectBoolKeys("interior", interior);
    collectBoolKeys("exterior", exterior);
    collectBoolKeys("environmental", environmental);
    collectBoolKeys("transportation", transportation);
    collectBoolKeys("views", views);
    collectBoolKeys("accessibility", accessibility);
    collectBoolKeys("housingType", housingType);
    collectBoolKeys("facade", facade);

    const form = document.getElementById("editFormContent");
    form.innerHTML = `
      <input type="hidden" name="id" value="${Number(data.id)}">
      <div class="hidden" id="boolKeysHolder" data-boolkeys='${escapeHtml(JSON.stringify(boolKeys))}'></div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        ${buildSection("Genel Bilgiler", `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${buildField("title", "Balık", data.title || "")}
            ${buildField("price", "Fiyat", data.price ?? "", "number")}
            ${buildField("currency", "Para Birimi", data.currency ?? "₺")}
          </div>
          <div class="mt-4">
            ${buildTextarea("description", "Açıklama", data.description || "")}
          </div>
        `)}

        ${buildSection("Fotoğraflar", `
          <div class="text-sm text-gray-600 mb-2">Her satıra 1 foto URL yaz. Kaydedince foto listesi yenilenir.</div>
          <textarea class="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brandYellow min-h-[140px]" name="photos_text">${escapeHtml(photos.join("\n"))}</textarea>
          <div class="mt-4 flex gap-2 overflow-x-auto">
            ${photos.map((p) => `<img src="${escapeHtml(p)}" class="w-20 h-20 object-cover rounded-xl border" alt="photo">`).join("")}
          </div>
        `)}
      </div>

      <div class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        ${renderGroup("location", "Lokasyon", location, numberKeys)}
        ${renderGroup("spec", "İlan Bilgileri", spec, numberKeys)}
        ${renderGroup("agent", "Danışman", agent, numberKeys)}
      </div>

      <div class="mt-6 grid grid-cols-1 gap-6">
        ${renderGroup("interior", "İç Özellikler", interior, numberKeys)}
        ${renderGroup("exterior", "Dış Özellikler", exterior, numberKeys)}
        ${renderGroup("environmental", "Çevre Özellikler", environmental, numberKeys)}
        ${renderGroup("transportation", "Ulaşım Özellikler", transportation, numberKeys)}
        ${renderGroup("views", "Manzara Özellikler", views, numberKeys)}
        ${renderGroup("accessibility", "Erişilebilirlik", accessibility, numberKeys)}
        ${renderGroup("housingType", "Konut Tipi", housingType, numberKeys)}
        ${renderGroup("facade", "Cephe", facade, numberKeys)}
      </div>
    `;

    document.getElementById("editModal").classList.remove("hidden");
  } catch (err) {
    console.error("Edit modal açılırken hata:", err);
    alert("Veri alınamadı: " + err.message);
  }
}

function buildEditPayload(fd) {
  const payload = {
    id: Number(fd.get("id")),
    title: fd.get("title") || "",
    description: fd.get("description") || "",
    price: toNumberOrNull(fd.get("price")),
    currency: fd.get("currency") || "₺",
    location: {},
    specifications: {},
    agent: {},
    interior_features: {},
    exterior_features: {},
    environmental_features: {},
    transportation: {},
    views: {},
    accessibility: {},
    housingType: {},
    facade: {},
    photos: parsePhotosText(fd.get("photos_text")),
  };

  const numberByGroup = {
    location: new Set(["latitude", "longitude"]),
    spec: new Set(["bathrooms", "gross_sqm", "net_sqm", "building_age", "floors"]),
  };

  for (const [key, value] of fd.entries()) {
    if (!key.includes("__")) continue;

    const [group, prop] = key.split("__");
    const strVal = String(value || "").trim();

    const applyValue = (target, groupName) => {
      if (numberByGroup[groupName]?.has(prop)) {
        target[prop] = toNumberOrNull(strVal);
      } else {
        target[prop] = strVal === "" ? null : strVal;
      }
    };

    if (group === "location") applyValue(payload.location, "location");
    if (group === "spec") applyValue(payload.specifications, "spec");
    if (group === "agent") applyValue(payload.agent, "agent");
    if (group === "interior") payload.interior_features[prop] = 1;
    if (group === "exterior") payload.exterior_features[prop] = 1;
    if (group === "environmental") payload.environmental_features[prop] = 1;
    if (group === "transportation") payload.transportation[prop] = 1;
    if (group === "views") payload.views[prop] = 1;
    if (group === "accessibility") payload.accessibility[prop] = 1;
    if (group === "housingType") payload.housingType[prop] = 1;
    if (group === "facade") payload.facade[prop] = 1;
  }

  const holder = document.getElementById("boolKeysHolder");
  const boolKeys = holder ? JSON.parse(holder.dataset.boolkeys || "[]") : [];
  for (const item of boolKeys) {
    const map = {
      interior: payload.interior_features,
      exterior: payload.exterior_features,
      environmental: payload.environmental_features,
      transportation: payload.transportation,
      views: payload.views,
      accessibility: payload.accessibility,
      housingType: payload.housingType,
      facade: payload.facade,
    };

    if (map[item.group] && map[item.group][item.key] !== 1) {
      map[item.group][item.key] = 0;
    }
  }

  return payload;
}

async function onEditSubmit(e) {
  e.preventDefault();

  if (!confirm("Değişiklikler kaydedilsin mi?")) return;

  const fd = new FormData(e.target);
  const payload = buildEditPayload(fd);

  try {
    const res = await fetch(`${BACKEND}/properties/${payload.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || res.statusText);

    alert("✅ İlan güncellendi");
    closeEditModal();
    await loadProperties();
  } catch (err) {
    console.error("Güncelleme hatası:", err);
    alert("❌ Güncellenemedi: " + err.message);
  }
}

async function onDeleteConfirm() {
  if (!deletePropertyId) return;

  const btn = document.getElementById("confirmDeleteBtn");
  btn.disabled = true;
  const oldText = btn.textContent;
  btn.textContent = "Siliniyor...";

  try {
    const res = await fetch(`${BACKEND}/properties/${deletePropertyId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || res.statusText);

    alert("✅ İlan tamamen silindi");
    hideDeleteModal();
    await loadProperties();
  } catch (err) {
    console.error("Silme hatası:", err);
    alert("Silme hatası: " + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = oldText;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("cancelDelete").addEventListener("click", hideDeleteModal);
  document.getElementById("confirmDeleteBtn").addEventListener("click", onDeleteConfirm);
  document.getElementById("deleteModal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("deleteModal")) hideDeleteModal();
  });

  document.getElementById("closeEditBtn").addEventListener("click", closeEditModal);
  document.getElementById("cancelEdit").addEventListener("click", closeEditModal);
  document.getElementById("editModal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("editModal")) closeEditModal();
  });
  document.getElementById("editForm").addEventListener("submit", onEditSubmit);

  loadProperties();
});
