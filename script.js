
   const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");

  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });
  document.addEventListener('DOMContentLoaded', function () {
    // Masaüstü: Gayrimenkul Dropdown (üst menü)
    const dropdownBtn = document.getElementById("mainDropdownBtn");
    const dropdown = document.getElementById("mainDropdown");
    const dropdownWrapper = document.getElementById("dropdownWrapper");

    if (dropdownBtn && dropdown && dropdownWrapper) {
      dropdownBtn.addEventListener("click", () => {
        dropdown.classList.toggle("hidden");
      });

      // Sayfa dışına tıklanınca dropdown kapansın
      document.addEventListener("click", (e) => {
        if (!dropdownWrapper.contains(e.target)) {
          dropdown.classList.add("hidden");
        }
      });
    }

    // Mobil Menü: Aç/Kapa
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener('click', function () {
        mobileMenu.classList.toggle('hidden');
      });
    }

  
  });

 const popupOverlay = document.getElementById("popup-overlay");
const filterForm = document.getElementById("filter-form");
const startButtons = document.getElementById("popup-start-buttons");

function openPopup() {
  popupOverlay.classList.remove("hidden");
  document.body.style.overflow = "hidden"; // Arka plan kaymasını engelle
}

function showFilterForm() {
  filterForm.classList.remove("hidden");
  startButtons.classList.add("hidden");
}

function closePopup() {
  popupOverlay.classList.add("hidden");
  filterForm.classList.add("hidden");
  startButtons.classList.remove("hidden");
  document.body.style.overflow = ""; // Arka plan kaydırmayı tekrar aç
}
