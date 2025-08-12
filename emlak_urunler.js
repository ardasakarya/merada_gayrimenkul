// main.js
function toggleAdvancedFilters() {
    const adv = document.getElementById('advancedFilters');
    adv.classList.toggle('hidden');
}
  function toggleMobileFilters() {
    document.getElementById('filterSection').classList.toggle('hidden');
  }

  function toggleDropdown(id) {
    document.querySelectorAll('ul[id$="Dropdown"]').forEach(el => {
      if (el.id !== id) el.classList.add('hidden');
    });
    document.getElementById(id).classList.toggle('hidden');
  }

  function selectOption(labelId, value) {
    document.getElementById(labelId).innerText = value;
    // dropdown'ı kapat
    const dropdownId = labelId.replace("Label", "Dropdown");
    document.getElementById(dropdownId).classList.add("hidden");
  }

  // Sayfa dışında tıklanınca dropdown'ı kapat
  document.addEventListener('click', function (e) {
    const isDropdownButton = e.target.closest('button')?.onclick?.toString().includes('toggleDropdown');
    if (!isDropdownButton) {
      document.querySelectorAll('ul[id$="Dropdown"]').forEach(el => el.classList.add('hidden'));
    }
  });



  function applyFilters() {
    const selectedPrice = document.getElementById("priceLabel").innerText;
    const selectedType = document.getElementById("typeLabel").innerText;
    const selectedLocation = document.getElementById("locationLabel").innerText;
    const selectedBedroom = document.getElementById("bedroomLabel").innerText;
    const isForSale = document.getElementById("saleBtn").classList.contains("bg-primary");

    // Örnek: Filtre bilgilerini yazdır
    console.log("Filtreler:");
    console.log("Satış Türü:", isForSale ? "For Sale" : "For Rent");
    console.log("Fiyat Aralığı:", selectedPrice);
    console.log("Emlak Türü:", selectedType);
    console.log("Konum:", selectedLocation);
    console.log("Yatak Odası:", selectedBedroom);

    // Burada istersen filtreleri bir API isteğine gönderebilirsin
    // veya sayfada listeyi güncelleyebilirsin.
  }



document.addEventListener('DOMContentLoaded', function () {
    // Satış / Kiralama Toggle
    const saleBtn = document.getElementById('saleBtn');
    const rentBtn = document.getElementById('rentBtn');

    if (saleBtn && rentBtn) {
        saleBtn.addEventListener('click', function () {
            saleBtn.classList.add('bg-brandYellow', 'text-iconBoxColor');
            saleBtn.classList.remove('text-iconBoxColor');
            rentBtn.classList.remove('bg-brandYellow', 'text-iconBoxColor');
            rentBtn.classList.add('text-iconBoxColor');
        });

        rentBtn.addEventListener('click', function () {
            rentBtn.classList.add('bg-brandYellow', 'text-iconBoxColor');
            rentBtn.classList.remove('text-iconBoxColor');
            saleBtn.classList.remove('bg-brandYellow', 'text-iconBoxColor');
            saleBtn.classList.add('text-iconBoxColor');
        });
    }

    // Grid / Liste Görünümü Toggle
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    const gridView = document.getElementById('gridView');
    const listView = document.getElementById('listView');

    if (gridViewBtn && listViewBtn && gridView && listView) {
        gridViewBtn.addEventListener('click', function () {
            gridViewBtn.classList.add('bg-brandYellow', 'text-iconBoxColor');
            gridViewBtn.classList.remove('text-iconBoxColor');
            listViewBtn.classList.remove('bg-brandYellow', 'text-iconBoxColor');
            listViewBtn.classList.add('text-iconBoxColor');
            gridView.classList.remove('hidden');
            listView.classList.add('hidden');
        });

        listViewBtn.addEventListener('click', function () {
            listViewBtn.classList.add('bg-brandYellow', 'text-iconBoxColor');
            listViewBtn.classList.remove('text-iconBoxColor');
            gridViewBtn.classList.remove('bg-brandYellow', 'text-iconBoxColor');
            gridViewBtn.classList.add('text-iconBoxColor');
            listView.classList.remove('hidden');
            gridView.classList.add('hidden');
        });
    }

    // Kalp (Favori) Toggle
    
});
const filterMenu = document.getElementById("filterMenu");
const filterBtn = document.getElementById("filterToggleBtn");

let menuOpen = false;

function toggleFilterMenu() {
    const menuWidth = filterMenu.offsetWidth; // Menü genişliğini al

    if (!menuOpen) {
        // Menü aç
        filterMenu.classList.remove("-translate-x-full");
        filterBtn.style.transform = `translate(${menuWidth}px, -50%)`;
        menuOpen = true;
    } else {
        // Menü kapa
        filterMenu.classList.add("-translate-x-full");
        filterBtn.style.transform = `translate(0, -50%)`;
        menuOpen = false;
    }
}
