
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

function openPopup() {
  const overlay = document.getElementById('popup-overlay');
  const box = document.getElementById('popup-box');
  document.body.classList.add('overflow-hidden'); // Arka plan scroll kilitleniyor
  overlay.classList.remove('hidden');
  box.classList.remove('h-[90vh]', 'md:h-[90vh]');
  box.classList.add('h-[45vh]', 'md:h-[40vh]');
}

function openPopupFilter() {
  const box = document.getElementById('popup-box');
  const buttons = document.getElementById("popup-start-buttons");
  const form = document.getElementById("filter-form");

  box.classList.remove('h-[45vh]', 'md:h-[50vh]');
  box.classList.add('h-[80vh]', 'md:h-[70vh]');

  form.classList.remove("hidden");
  buttons.classList.add("hidden");
}

function closePopup() {
  const overlay = document.getElementById('popup-overlay');
  const box = document.getElementById('popup-box');
  const buttons = document.getElementById("popup-start-buttons");
  const form = document.getElementById("filter-form");

  document.body.classList.remove('overflow-hidden'); // Scroll kilidi kaldırılıyor
  box.classList.remove('h-[90vh]', 'md:h-[90vh]');
  box.classList.add('h-[45vh]', 'md:h-[50vh]');

  form.classList.add("hidden");
  buttons.classList.remove("hidden");

  overlay.classList.add('hidden');
}

