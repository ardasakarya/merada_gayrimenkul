//emlak_detay_script.js
// Backend URL
const BACKEND_URL = "http://127.0.0.1:5000";

let currentIndex = 0;
let photos = [];

// URL'den id parametresini çek
function getPropertyIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id"); // örnek: emlak_detay.html?id=5
}

// Backend'den gelen data ile galeriyi doldur
function renderGallery(data) {
  photos = data.photos || [];   // ✅ global photos array doluyor
  if (photos.length === 0) return;

  // Ana görsel
  const mainImage = document.getElementById("mainImage");
  if (mainImage) {
    mainImage.src = photos[0];
    mainImage.onclick = () => openGalleryPopup(0); // ✅ ana foto da popup açsın
  }

  // Mobil galeri
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

  // Desktop galeri
const desktopGallery = document.getElementById("desktop_gallery");
if (desktopGallery) {
  desktopGallery.innerHTML = "";
  photos.forEach((url, idx) => {
    if (idx < 3) {
      // İlk 3 fotoğraf normal
      const img = document.createElement("img");
      img.src = url;
      img.className = "gallery-thumb w-full h-32 object-cover rounded cursor-pointer hover:opacity-90";
      img.onclick = () => openGalleryPopup(idx);
      desktopGallery.appendChild(img);
    } else if (idx === 3) {
      if (photos.length === 4) {
        // Tam 4 fotoğraf varsa 4. fotoğrafı normal göster
        const img = document.createElement("img");
        img.src = url;
        img.className = "gallery-thumb w-full h-32 object-cover rounded cursor-pointer hover:opacity-90";
        img.onclick = () => openGalleryPopup(idx);
        desktopGallery.appendChild(img);
      } else {
        // 4’ten fazla fotoğraf varsa +N göster
        const wrapper = document.createElement("div");
        wrapper.className = "gallery-thumb relative w-full h-32 rounded cursor-pointer hover:opacity-90";
        wrapper.onclick = () => openGalleryPopup(idx);

        const img = document.createElement("img");
        img.src = url;
        img.className = "w-full h-32 object-cover rounded";

        const overlay = document.createElement("div");
        overlay.className = "absolute inset-0 bg-black/60 flex items-center justify-center rounded";

        const span = document.createElement("span");
        span.className = "text-white text-xl font-bold";
        const extraCount = photos.length - 4; // ✅ sadece fazlalığı yaz
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



// Ana görseli değiştirme
function setMainImage(url, idx) {
  const mainImage = document.getElementById("mainImage");
  if (mainImage) mainImage.src = url;
  currentIndex = idx;
}


function openGalleryPopup(startIndex = 0) {
  if (!photos || photos.length === 0) return;
  currentIndex = startIndex;

  const popup = document.getElementById("galleryPopup");
  popup.classList.remove("hidden");   // popup aç

  showSliderImage();
  renderThumbnails();
}

function closeGalleryPopup() {
  document.getElementById("galleryPopup").classList.add("hidden");
}

function showSliderImage() {
  const sliderImg = document.getElementById("sliderImage");
  if (sliderImg) {
    sliderImg.src = photos[currentIndex];
  }
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
    thumb.className = "w-20 h-20 object-cover rounded cursor-pointer border-2 transition hover:opacity-80";
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
    if (i === currentIndex) {
      t.classList.add("border-brandYellow");
    }
  });
}


// Veri çekme
function fetchProperty(id) {
  fetch(`${BACKEND_URL}/properties/${id}`)
    .then(res => res.json())
    .then(data => {
      console.log("Gelen data:", data);

      // Fotoğraf yollarını absolute URL'e çevir
      if (data.photos && data.photos.length > 0) {
        data.photos = data.photos.map(photo => {
          if (!photo) return "";
          // Eğer başında "uploads/" yoksa ekle
          if (!photo.startsWith("uploads/")) {
            photo = "uploads/" + photo;
          }
          // Tam URL oluştur
          return `${BACKEND_URL}/${photo}`;
        });
      }

      renderGallery(data);
    })
    .catch(err => console.error("Veri çekme hatası:", err));
}

// Sayfa yüklendiğinde id parametresini al ve çalıştır
document.addEventListener("DOMContentLoaded", () => {
  const id = getPropertyIdFromUrl();
  if (id) {
    fetchProperty(id);
  } else {
    console.error("URL'de id parametresi yok!");
  }
});




function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const propertyId = params.get("id") || 1;

  try {
    const res = await fetch(`http://127.0.0.1:5000/properties/${propertyId}`);
    if (!res.ok) throw new Error("API hatası");
    const data = await res.json();

    // Tarih formatlama
    const dateStr = data.specifications.listing_date;
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Başlık, fiyat, açıklama, adres
    document.getElementById("property_title").textContent = data.title;
    document.getElementById("property_price").textContent = `${data.currency} ${data.price.toLocaleString("tr-TR")}`;
    document.getElementById("property_description").textContent = data.description;
    document.getElementById("property_address").textContent = data.location.address;

    // Özellikler
    document.getElementById("listing_date").textContent = formattedDate;
    document.getElementById("gross_m2").textContent = data.specifications.gross_sqm + " m²";
    document.getElementById("net_m2").textContent = data.specifications.net_sqm + " m²";
    document.getElementById("rooms").textContent = data.specifications.rooms;
    document.getElementById("bathrooms").textContent = data.specifications.bathrooms;
    document.getElementById("building_age").textContent = data.specifications.building_age;
    document.getElementById("building_floors").textContent = data.specifications.floors;
    document.getElementById("floor").textContent = data.specifications.floor_location;
    document.getElementById("heating").textContent = data.specifications.heating_type;
    document.getElementById("furnished").textContent = data.specifications.furnished;
    document.getElementById("usage_status").textContent = data.specifications.usage_status;
    document.getElementById("credit_status").textContent = data.specifications.loan_status;
    document.getElementById("swap").textContent = data.specifications.exchange_status;
    document.getElementById("facade").textContent = data.specifications.facade;

    // Danışman
    document.getElementById("agent_name").textContent = data.agent.name;
    document.getElementById("agent_title").textContent = data.agent.title;
    document.getElementById("agent_phone").textContent = data.agent.phone;
    document.getElementById("agent_email").textContent = data.agent.email;
   document.getElementById("agent_photo").src = data.agent.photo || "img/placeholder-profile-male-500x500.png";

    // -----------------------------
    // İç Özellikler (Boolean: Var / Yok)
    // -----------------------------
  // İç Özellikler
const interior = data.interior_features;
document.getElementById("master_bedroom").textContent = interior.master_bedroom ? document.getElementById("master_bedroom").textContent : "-";
document.getElementById("guest_bedroom").textContent = interior.guest_bedroom ? document.getElementById("guest_bedroom").textContent : "-";
document.getElementById("walk_in_closet").textContent = interior.walk_in_closet ? document.getElementById("walk_in_closet").textContent : "-";
document.getElementById("ensuite_bathroom").textContent = interior.ensuite_bathroom ? document.getElementById("ensuite_bathroom").textContent : "-";
document.getElementById("modern_kitchen").textContent = interior.modern_kitchen ? document.getElementById("modern_kitchen").textContent : "-";
document.getElementById("kitchen_island").textContent = interior.kitchen_island ? document.getElementById("kitchen_island").textContent : "-";
document.getElementById("open_floor_plan").textContent = interior.open_floor_plan ? document.getElementById("open_floor_plan").textContent : "-";
document.getElementById("fireplace").textContent = interior.fireplace ? document.getElementById("fireplace").textContent : "-";
document.getElementById("hardwood_floors").textContent = interior.hardwood_floors ? document.getElementById("hardwood_floors").textContent : "-";
document.getElementById("high_ceilings").textContent = interior.high_ceilings ? document.getElementById("high_ceilings").textContent : "-";
document.getElementById("central_air").textContent = interior.central_air ? document.getElementById("central_air").textContent : "-";
document.getElementById("smart_home_features").textContent = interior.smart_home_features ? document.getElementById("smart_home_features").textContent : "-";
document.getElementById("custom_notes").textContent = interior.custom_notes || "-";

// Dış Özellikler
const exterior = data.exterior_features;
document.getElementById("balcony").textContent = exterior.balcony ? document.getElementById("balcony").textContent : "-";
document.getElementById("terrace").textContent = exterior.terrace ? document.getElementById("terrace").textContent : "-";
document.getElementById("garden").textContent = exterior.garden ? document.getElementById("garden").textContent : "-";
document.getElementById("garage").textContent = exterior.garage ? document.getElementById("garage").textContent : "-";
document.getElementById("parking").textContent = exterior.parking ? document.getElementById("parking").textContent : "-";
document.getElementById("swimming_pool").textContent = exterior.swimming_pool ? document.getElementById("swimming_pool").textContent : "-";
document.getElementById("barbecue_area").textContent = exterior.barbecue_area ? document.getElementById("barbecue_area").textContent : "-";
document.getElementById("playground").textContent = exterior.playground ? document.getElementById("playground").textContent : "-";

// Çevre Özellikler
const env = data.environmental_features;
document.getElementById("near_school").textContent = env.near_school ? document.getElementById("near_school").textContent : "-";
document.getElementById("near_hospital").textContent = env.near_hospital ? document.getElementById("near_hospital").textContent : "-";
document.getElementById("near_market").textContent = env.near_market ? document.getElementById("near_market").textContent : "-";
document.getElementById("near_transport").textContent = env.near_transport ? document.getElementById("near_transport").textContent : "-";
document.getElementById("sea_view").textContent = env.sea_view ? document.getElementById("sea_view").textContent : "-";
document.getElementById("mountain_view").textContent = env.mountain_view ? document.getElementById("mountain_view").textContent : "-";
document.getElementById("park_nearby").textContent = env.park_nearby ? document.getElementById("park_nearby").textContent : "-";

//adres
const loc = data.location;

// --- Harita embed ---
if (loc.latitude && loc.longitude) {
  const lat = parseFloat(loc.latitude);
  const lng = parseFloat(loc.longitude);

  if (!isNaN(lat) && !isNaN(lng)) {
    const zoom = 16; // zoom seviyesini buradan değiştirebilirsin
    const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed&center=${lat},${lng}&markers=${lat},${lng}`;
    document.getElementById("property_map").src = embedUrl;

    // --- Inputları doldur ---
    const latInput = document.getElementById("latitude");
    const lngInput = document.getElementById("longitude");
    if (latInput) latInput.value = lat;
    if (lngInput) lngInput.value = lng;
  } else {
    console.warn("Geçersiz enlem/boylam:", loc);
    document.getElementById("property_map").style.display = "none";
  }
} else {
  console.warn("Eksik konum bilgisi:", loc);
  document.getElementById("property_map").style.display = "none";
}

// --- Açık adres metni ---
const addressParts = [
    loc.street_address,
    loc.street,
    loc.neighborhood,
    loc.district,
    loc.city,
    loc.zip_code
].filter(Boolean); // boş olanları çıkarır

const fullAddress = addressParts.join(", ");
const addressEl = document.getElementById("property_address");
if (addressEl) addressEl.textContent = fullAddress || "-";

  } catch (err) {
    console.error("❌ Veri çekme hatası:", err);
  }
});
