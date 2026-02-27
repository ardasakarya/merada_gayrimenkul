// urunEkle.js

// === SABİTLER ===
const API_URL = "http://127.0.0.1:5000"; // backend/server.js portun
const TOKEN_KEY = "adminToken";          // login.js'te kaydettiğin anahtar


const userMenuButton = document.getElementById("userMenuButton");
  const userDropdown = document.getElementById("userDropdown");
  const logoutBtn = document.getElementById("logoutBtn");

  // Menü aç/kapat
  userMenuButton.addEventListener("click", () => {
    userDropdown.classList.toggle("hidden");
  });

  // Sayfa başka yere tıklanınca kapat
  document.addEventListener("click", (e) => {
    if (!userMenuButton.contains(e.target) && !userDropdown.contains(e.target)) {
      userDropdown.classList.add("hidden");
    }
  });

  // Çıkış işlemi
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem(TOKEN_KEY); // token'ı siliyoruz
    window.location.href = "/meradaAdmin/frontend/login.html"; // login sayfasına yönlendir
  });
// === YARDIMCI FONKSİYONLAR ===
function setText(id, text) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text ?? "";
}

function setHTML(id, html) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = html ?? "";
}

// === SAYFA YÜKLENİNCE ===
document.addEventListener("DOMContentLoaded", function () {
  // ---------- Fiyat input format ---------- //
  const priceInput = document.getElementById("price");
  if (priceInput) {
    priceInput.addEventListener("input", function (e) {
      let value = e.target.value.replace(/\D/g, "");
      if (!value) {
        e.target.value = "";
        return;
      }
      const formatted = Number(value).toLocaleString("tr-TR");
      e.target.value = formatted;
      e.target.setSelectionRange(formatted.length, formatted.length);
    });
  }

  const form = document.getElementById("propertyForm");
  const saveBtn = document.getElementById("saveBtn");
  const photoInput = document.getElementById("photoInput");
  const previewContainer = document.getElementById("previewContainer");

  if (!form || !saveBtn) {
    console.error("❌ Form veya buton bulunamadı!");
    return;
  }

  let selectedFiles = [];

  // ---------- Fotoğraf önizleme ---------- //
  if (photoInput && previewContainer) {
    photoInput.addEventListener("change", () => {
      Array.from(photoInput.files).forEach((file) => {
        if (!file.type.startsWith("image/")) return;
        const fileId = Date.now() + Math.random();
        selectedFiles.push({ id: fileId, file });

        const reader = new FileReader();
        reader.onload = (e) => {
          const div = document.createElement("div");
          div.className = "relative group";
          div.innerHTML = `
            <img src="${e.target.result}" alt="Preview" class="w-full h-32 object-cover rounded-lg">
            <button type="button" data-id="${fileId}"
              class="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              X
            </button>
          `;
          div.querySelector("button").addEventListener("click", (ev) => {
            const id = ev.target.getAttribute("data-id");
            selectedFiles = selectedFiles.filter((f) => f.id != id);
            div.remove();
          });
          previewContainer.appendChild(div);
        };
        reader.readAsDataURL(file);
      });
      photoInput.value = "";
    });
  }

  // ---------- Maps (Label -> DB column) ---------- //
  const interiorMap = {
    "ADSL": "adsl",
    "Ahşap Doğrama": "wood_joinery",
    "Akıllı Ev": "smart_home",
    "Alarm (Hırsız)": "alarm_burglar",
    "Alarm (Yangın)": "alarm_fire",
    "Alaturka Tuvalet": "turkish_wc",
    "Alüminyum Doğrama": "aluminum_joinery",
    "Amerikan Kapı": "american_door",
    "Ankastre Fırın": "built_in_oven",
    "Barbekü": "barbecue",
    "Beyaz Eşya": "white_goods",
    "Boyalı": "painted",
    "Bulaşık Makinesi": "dishwasher",
    "Buzdolabı": "refrigerator",
    "Çamaşır Kurutma Makinesi": "dryer",
    "Çamaşır Makinesi": "washing_machine",
    "Çamaşır Odası": "laundry_room",
    "Çelik Kapı": "steel_door",
    "Duşakabin": "shower_cabin",
    "Duvar Kağıdı": "wallpaper",
    "Ebeveyn Banyosu": "ensuite_bathroom",
    "Fiber İnternet": "fiber",
    "Giyinme Odası": "dressing_room",
    "Gömme Dolap": "built_in_closet",
    "Görüntülü Diyafon": "video_intercom",
    "Hilton Banyo": "hilton_bathroom",
    "Intercom Sistemi": "intercom_system",
    "Isıcam": "double_glazing",
    "Jakuzi": "jacuzzi",
    "Kartonpiyer": "cornice",
    "Kiler": "pantry",
    "Klima": "air_conditioning",
    "Küvet": "bathtub",
    "Laminat Zemin": "laminate_floor",
    "Marley": "marley",
    "Mobilya": "furnished",
    "Mutfak (Ankastre)": "built_in_kitchen",
    "Mutfak Doğalgazı": "natural_gas_kitchen",
    "Panjur / Jaluzi": "shutter",
    "Parke Zemin": "parquet",
    "PVC Doğrama": "pvc_joinery",
    "Seramik Zemin": "ceramic_floor",
    "Set Üstü Ocak": "set_top_stove",
    "Spot Aydınlatma": "spot_lighting",
    "Şofben": "water_heater",
    "Şömine": "fireplace",
    "Teras": "terrace",
    "Vestiyer": "vestiaire",
    "Wi-Fi": "wifi",
    "Yüz Tanıma & Parmak İzi": "biometric_system",
  };

  const exteriorMap = {
    "Araç Şarj İstasyonu": "ev_charging_station",
    "24 Saat Güvenlik": "security_24h",
    "Apartman Görevlisi": "janitor",
    "Buhar Odası": "steam_room",
    "Çocuk Oyun Parkı": "playground",
    "Hamam": "hammam",
    "Hidrofor": "hydrofor",
    "Isı Yalıtımı": "thermal_insulation",
    "Jeneratör": "generator",
    "Kablo TV": "cable_tv",
    "Kamera Sistemi": "camera_system",
    "Kreş": "nursery",
    "Yüzme Havuzu (Açık)": "open_pool",
    "Yüzme Havuzu (Kapalı)": "indoor_pool",
    "Özel Havuz": "private_pool",
    "Sauna": "sauna",
    "Ses Yalıtımı": "sound_insulation",
    "Siding": "siding",
    "Spor Alanı": "sports_area",
    "Su Deposu": "water_tank",
    "Tenis Kortu": "tennis_court",
    "Uydu": "satellite",
    "Yangın Merdiveni": "fire_escape",
  };

  const environmentalMap = {
    "Alışveriş Merkezi": "shopping_mall",
    "Belediye": "municipality",
    "Cami": "mosque",
    "Cemevi": "cemevi",
    "Denize Sıfır": "seafront",
    "Eczane": "pharmacy",
    "Eğlence Merkezi": "entertainment_center",
    "Fuar": "fair",
    "Göle Sıfır": "lakefront",
    "Hastane": "hospital",
    "Havra": "synagogue",
    "İlkokul-Ortaokul": "primary_school",
    "İtfaiye": "fire_station",
    "Kilise": "church",
    "Lise": "high_school",
    "Market": "market",
    "Park": "park",
    "Plaj": "beach",
    "Polis Merkezi": "police_station",
    "Sağlık Ocağı": "health_center",
    "Semt Pazarı": "street_market",
    "Spor Salonu": "gym",
    "Şehir Merkezi": "city_center",
    "Üniversite": "university",
  };

  const transportationMap = {
    "Anayol": "main_road",
    "Cadde": "avenue",
    "Dolmuş": "dolmus",
    "E-5": "e5",
    "Havaalanı": "airport",
    "Marmaray": "marmaray",
    "Metro": "metro",
    "Metrobüs": "metrobus",
    "Minibüs": "minibus",
    "Otobüs Durağı": "bus_stop",
    "Sahil": "coast",
    "TEM": "tem",
    "Tren İstasyonu": "train_station",
    "Tramvay": "tram",
  };

  const viewMap = {
    "Boğaz": "bosporus",
    "Deniz": "sea",
    "Doğa": "nature",
    "Göl": "lake",
    "Havuz": "pool",
    "Nehir": "river",
    "park": "park",
    "Şehir": "city",
  };

  const housingTypeMap = {
    "Dubleks": "duplex",
    "En Üst Kat": "top_floor",
    "Ara Kat": "middle_floor",
    "Bahçe Dubleksi": "garden_duplex",
    "Çatı Dubleksi": "roof_duplex",
    "Ters Dubleks": "reverse_duplex",
    "Tripleks": "triplex",
  };

  const accessibilityMap = {
    "Araç Park Yeri": "accessible_parking",
    "Engelliye Uygun Mutfak": "accessible_kitchen",
    "Geniş Koridor": "wide_corridor",
    "Tuvalet": "accessible_wc",
    "Engelliye Uygun Asansör": "accessible_elevator",
    "Engelliye Uygun Banyo": "accessible_bathroom",
    "Giriş / Rampa": "ramp",
    "Tutamak / Korkuluk": "handrails",
  };

  const facadeMap = {
    "Batı": "west",
    "Doğu": "east",
    "Güney": "south",
    "Kuzey": "north",
  };

  // ---------- Helper fonksiyonlar ---------- //
  const buildDefaults = (columns) =>
    columns.reduce((acc, c) => ((acc[c] = 0), acc), {});

  const val = (id) => document.getElementById(id)?.value ?? "";
  const num = (id) => {
    const v = document.getElementById(id)?.value;
    return v === "" || v === undefined || v === null ? null : Number(v);
  };

  const collectByName = (nameAttr) =>
    Array.from(document.querySelectorAll(`input[type="checkbox"][name="${nameAttr}"]`)).map((cb) => ({
      text: (cb.value || "").trim(),
      checked: !!cb.checked,
    }));

  // ---------- Kaydet (ADD PROPERTY) ---------- //
  saveBtn.addEventListener("click", async () => {
    // 🔐 1) Token al
    const token = localStorage.getItem(TOKEN_KEY);
    console.log("adminToken:", token);

    if (!token) {
      alert("Oturum bulunamadı veya süresi dolmuş. Lütfen tekrar giriş yapın.");
      // İstersen login'e gönder:
      // window.location.href = "login.html";
      return;
    }

    const title = (form.title?.value || "").trim();
    const rawPrice = (form.price?.value || "").trim();
    const price = rawPrice.replace(/\./g, "");
    const currency = form.currency?.value || "";
    const description = (form.description?.value || "").trim();
 const listing_type = form.listing_type?.value || "";
    const agent_name = document.getElementById("agent_name")?.value.trim() || "";
    const agent_phone = document.getElementById("agent_phone")?.value.trim() || "";
    const agent_email = document.getElementById("agent_email")?.value.trim() || "";

    const district = val("district");
    const neighborhood = val("neighborhood");
    const street = val("street");
    const streetAddress = val("streetAddress");
    const zipCode = val("zipCode");
    const latitude = val("latitude") || null;
    const longitude = val("longitude") || null;

    const specifications = {
      listing_date: val("listingDate") || null,
      gross_sqm: num("grossSqm"),
      net_sqm: num("netSqm"),
      rooms: val("roomsSelect") || null,
      building_age: num("buildingAge"),
      floors: num("totalFloors"),
      floor_location: num("floorLocation"),
      heating_type: val("heatingTypeSelect") || null,
      bathrooms: num("bathroomsCount"),
    };

     if (!title || !price || !currency || !description || !listing_type) {
      alert("Lütfen ilan türü dahil zorunlu alanları doldurun.");
      return;
    }

    // Tüm özellikleri 0 ile başlat
    const interiorBooleans = buildDefaults(Object.values(interiorMap));
    const exteriorBooleans = buildDefaults(Object.values(exteriorMap));
    const environmentalBooleans = buildDefaults(Object.values(environmentalMap));
    const transportationBooleans = buildDefaults(Object.values(transportationMap));
    const viewBooleans = buildDefaults(Object.values(viewMap));
    const accessibilityBooleans = buildDefaults(Object.values(accessibilityMap));
    const housingTypeBooleans = buildDefaults(Object.values(housingTypeMap));
    const facadeBooleans = buildDefaults(Object.values(facadeMap));

    // Checkbox okuma
    collectByName("ic_ozellikler[]").forEach((item) => {
      const key = interiorMap[item.text];
      if (key) interiorBooleans[key] = item.checked ? 1 : 0;
    });
    collectByName("dis_ozellikler[]").forEach((item) => {
      const key = exteriorMap[item.text];
      if (key) exteriorBooleans[key] = item.checked ? 1 : 0;
    });
    collectByName("muhit[]").forEach((item) => {
      const key = environmentalMap[item.text];
      if (key) environmentalBooleans[key] = item.checked ? 1 : 0;
    });
    collectByName("ulasim[]").forEach((item) => {
      const key = transportationMap[item.text];
      if (key) transportationBooleans[key] = item.checked ? 1 : 0;
    });
    collectByName("manzara[]").forEach((item) => {
      const key = viewMap[item.text];
      if (key) viewBooleans[key] = item.checked ? 1 : 0;
    });
    collectByName("konut_tipi[]").forEach((item) => {
      const key = housingTypeMap[item.text];
      if (key) housingTypeBooleans[key] = item.checked ? 1 : 0;
    });
    collectByName("engelli[]").forEach((item) => {
      const key = accessibilityMap[item.text];
      if (key) accessibilityBooleans[key] = item.checked ? 1 : 0;
    });
    collectByName("cephe[]").forEach((item) => {
      const key = facadeMap[item.text];
      if (key) facadeBooleans[key] = item.checked ? 1 : 0;
    });

    const payload = {
      title,
      price,
      currency,
      description,
       listing_type,
      location: {
        city: "Mersin",
        district,
        neighborhood,
        street,
        streetAddress,
        zipCode,
        latitude,
        longitude,
      },
      specifications,
      features: {
        interior: interiorBooleans,
        exterior: exteriorBooleans,
        environmental: environmentalBooleans,
        transportation: transportationBooleans,
        view: viewBooleans,
        accessibility: accessibilityBooleans,
        housingType: housingTypeBooleans,
        facade: facadeBooleans,
      },
      agent: {
        name: agent_name,
        phone: agent_phone,
        email: agent_email,
      },
    };

    console.log("📦 Gönderilecek veri:", payload);

    try {
      // 🔐 2) Tokenli add-property isteği
      const res = await fetch(`${API_URL}/add-property`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bilinmeyen hata");

      const propertyId = data.propertyId;
      if (!propertyId) throw new Error("propertyId bulunamadı");

      // Fotoğraf yüklemesi varsa
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        formData.append("propertyId", propertyId);
        selectedFiles.forEach((f) => formData.append("photos", f.file));

        const photoRes = await fetch(`${API_URL}/upload-photos`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // 🔐 Token burada da
          },
          body: formData,
        });

        const photoData = await photoRes.json();
        if (!photoRes.ok) throw new Error(photoData.error || "Fotoğraf yükleme hatası");
      }

      alert(`${data.message} (id: ${propertyId})`);
      form.reset();
      if (previewContainer) previewContainer.innerHTML = "";
      selectedFiles = [];

    } catch (err) {
      console.error("❌ Kaydetme hatası:", err);
      alert("Sunucuya bağlanılamadı: " + err.message);
    }
  });

  // ---------- İlçe / Mahalle / Sokak ---------- //
  const neighborhoods = {
    Akdeniz: {
      Bahçe: ["1. Cadde", "2. Cadde", "Atatürk Sokak"],
      Barbaros: ["Liman Cd.", "Deniz Sk."],
      Camiişerif: ["İnönü Cd.", "Çarşı Sk."],
    },
    Mezitli: {
      Davultepe: ["Sahil Cd.", "Güneş Sk."],
      Kuyuluk: ["Orman Cd.", "Vadi Sk."],
      Viranşehir: ["Deniz Cd.", "Okul Sk."],
    },
    Yenişehir: {
      Cumhuriyet: ["19 Mayıs Cd.", "Gençlik Sk."],
      "İnönü": ["Barış Cd.", "Sanayi Sk."],
      Gazi: ["Kültür Cd.", "Park Sk."],
    },
  };

  const districtEl = document.getElementById("district");
  const neighborhoodEl = document.getElementById("neighborhood");
  const streetEl = document.getElementById("street");

  if (districtEl && neighborhoodEl && streetEl) {
    districtEl.addEventListener("change", (e) => {
      const district = e.target.value;
      neighborhoodEl.innerHTML = "<option value=''>Mahalle Seçin</option>";
      streetEl.innerHTML = "<option value=''>Sokak Seçin</option>";

      if (neighborhoods[district]) {
        Object.keys(neighborhoods[district]).forEach((m) => {
          neighborhoodEl.innerHTML += `<option value="${m}">${m}</option>`;
        });
      }
    });

    neighborhoodEl.addEventListener("change", (e) => {
      const district = districtEl.value;
      const neighborhood = e.target.value;
      streetEl.innerHTML = "<option value=''>Sokak Seçin</option>";

      if (neighborhoods[district] && neighborhoods[district][neighborhood]) {
        neighborhoods[district][neighborhood].forEach((st) => {
          streetEl.innerHTML += `<option value="${st}">${st}</option>`;
        });
      }
    });
  }

  // ---------- Leaflet Harita ---------- //
  if (window.L && document.getElementById("map")) {
    const map = L.map("map").setView([36.8, 34.6], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    const marker = L.marker([36.8, 34.6], { draggable: true }).addTo(map);

    marker.on("dragend", function () {
      const { lat, lng } = marker.getLatLng();
      const latEl = document.getElementById("latitude");
      const lngEl = document.getElementById("longitude");
      if (latEl) latEl.value = lat.toFixed(6);
      if (lngEl) lngEl.value = lng.toFixed(6);
    });

    ["latitude", "longitude"].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("change", () => {
        const lat = parseFloat(document.getElementById("latitude")?.value);
        const lng = parseFloat(document.getElementById("longitude")?.value);
        if (!isNaN(lat) && !isNaN(lng)) {
          marker.setLatLng([lat, lng]);
          map.setView([lat, lng], 16);
        }
      });
    });
  }
});