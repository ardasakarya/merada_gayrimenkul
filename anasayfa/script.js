
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

