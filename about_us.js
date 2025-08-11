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


   (function(){
    // Toggle flip on tap for touch devices
    document.querySelectorAll('article.group').forEach(function(card){
      const inner = card.querySelector('div.relative[tabindex="0"]') || card.querySelector('div.relative');
      // if touch device, toggle on click (but ignore clicks on icon buttons)
      card.addEventListener('click', function(e){
        if(e.target.closest('button[data-href]')) return;
        if(window.matchMedia && window.matchMedia('(hover: none)').matches){
          // toggle inline transform to flip/unflip
          const current = inner.style.transform || '';
          if(current.includes('rotateY(180deg)')){
            inner.style.transform = '';
          } else {
            inner.style.transform = 'rotateY(180deg)';
          }
        }
      });
      // keyboard toggling for accessibility
      card.addEventListener('keydown', function(e){
        if(e.key === 'Enter' || e.key === ' '){
          e.preventDefault();
          const current = inner.style.transform || '';
          inner.style.transform = current.includes('rotateY(180deg)') ? '' : 'rotateY(180deg)';
        }
      });
    });

    // Delegate icon clicks -> use data-href attribute
    document.addEventListener('click', function(e){
      const btn = e.target.closest('button[data-href]');
      if(!btn) return;
      const href = btn.getAttribute('data-href');
      if(!href) return;
      if(href.startsWith('mailto:') || href.startsWith('tel:')){
        window.location.href = href;
      } else {
        window.open(href, '_blank', 'noopener');
      }
    });
  })();



const teamMembers = [
  {
    name: "Sarah Johnson",
    title: "President & CEO",
    description: "With over 20 years of industry experience, Sarah leads our strategic vision and global expansion initiatives.",
    image: "https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20confident%20business%20executive%20woman%20in%20modern%20corporate%20attire%2C%20clean%20studio%20lighting%2C%20professional%20photography%20style%2C%20contemporary%20business%20portrait%20with%20neutral%20background&width=300&height=300&seq=leader001&orientation=squarish",
    email: "sarah.johnson@example.com",
    phone: "+1234567890",
    whatsapp: "901234567890"
  },
  {
    name: "Michael Chen",
    title: "Vice President of Operations",
    description: "Michael oversees our operational excellence and member services, ensuring exceptional experiences for all members.",
    image: "https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20distinguished%20business%20executive%20man%20in%20formal%20business%20suit%2C%20confident%20expression%2C%20studio%20lighting%2C%20corporate%20photography%20style%20with%20clean%20neutral%20background&width=300&height=300&seq=leader002&orientation=squarish",
    email: "michael.chen@example.com",
    phone: "+1987654321",
    whatsapp: "901234567891"
  },
  {
    name: "Dr. Emily Rodriguez",
    title: "Director of Research",
    description: "Dr. Rodriguez leads our research initiatives and innovation programs, driving industry advancement through evidence-based insights.",
    image: "https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20accomplished%20business%20woman%20executive%20in%20contemporary%20business%20attire%2C%20warm%20professional%20smile%2C%20studio%20photography%20with%20clean%20background%2C%20corporate%20portrait%20style&width=300&height=300&seq=leader003&orientation=squarish",
    email: "emily.rodriguez@example.com",
    phone: "+1122334455",
    whatsapp: "901234567892"
  },
  {
    name: "David Chen",
    title: "Director of Research",
    description: "David specializes in guiding first-time homebuyers through the process with patience and expertise, making homeownership dreams accessible to all.",
    image: "https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20confident%20middle-aged%20businessman%20in%20navy%20suit%20and%20tie%2C%20warm%20smile%2C%20clean%20white%20background%2C%20corporate%20photography%20style%2C%20high%20quality%20portrait%2C%20professional%20lighting%2C%20friendly%20approachable%20expression&width=300&height=300&seq=agent1&orientation=squarish",
    email: "david.chen@example.com",
    phone: "+1098765432",
    whatsapp: "901234567893"
  },
  {
    name: "Sarah Williams",
    title: "Valued Clients",
    description: "Sarah brings 8 years of commercial real estate expertise, focusing on office buildings, retail spaces, and investment properties throughout the metro area.",
    image: "https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20confident%20businesswoman%20in%20elegant%20blazer%2C%20warm%20genuine%20smile%2C%20clean%20white%20background%2C%20corporate%20photography%20style%2C%20high%20quality%20portrait%2C%20professional%20lighting%2C%20approachable%20friendly%20expression%2C%20shoulder%20length%20hair&width=300&height=300&seq=agent2&orientation=squarish",
    email: "sarah.williams@example.com",
    phone: "+1011121314",
    whatsapp: "901234567894"
  },
  {
    name: "Michael Johnson",
    title: "Valued Client",
    description: "Michael shares his positive experience working with Prime Properties, emphasizing our dedication to client success.",
    image: "https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20successful%20businessman%20in%20suit%20smiling%20confidently%2C%20clean%20white%20background%2C%20natural%20lighting%2C%20genuine%20expression%20of%20satisfaction%2C%20professional%20appearance&width=80&height=80&seq=client2&orientation=squarish",
    email: "michael.johnson@example.com",
    phone: "+1151515151",
    whatsapp: "901234567895"
  }
];

const teamContainer = document.getElementById("team");

teamMembers.forEach(member => {
  const card = `
    <article class="group relative" aria-label="Card: ${member.name}">
    
      <div class="w-full" style="perspective:1200px;">
        <div class="relative w-full rounded-2xl shadow-lg transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus-within:[transform:rotateY(180deg)]" tabindex="0">
          
          <!-- FRONT -->
          <div class="bg-white p-8 rounded-2xl backface-hidden relative">
            <img src="${member.image}" alt="${member.name}" class="w-32 h-32 object-cover object-top rounded-full mx-auto mb-6">
            <h4 class="text-xl font-bold text-iconBoxColor mb-2 text-center">${member.name}</h4>
            <div class="mx-auto mt-2 mb-4 w-14 h-1 rounded-full bg-gradient-to-r from-sky-500 to-sky-700 origin-left transform scale-x-0 group-hover:scale-x-100 group-focus-within:scale-x-100 transition-transform duration-700"></div>
            <p class="text-brandYellow font-medium mb-4 text-center">${member.title}</p>
            <p class="text-gray-600 text-sm leading-relaxed text-center">${member.description}</p>
          </div>

          <!-- BACK -->
     <div class="absolute inset-0 rounded-2xl p-8 [transform:rotateY(180deg)] [backface-visibility:hidden] bg-gradient-to-br from-white to-slate-50">
  <div class="text-center mb-4">
    <p class="text-sm font-semibold text-gray-900"> ${member.name} ile iletişime geçmek için aşağıdaki bilgileri kullanabilirsiniz:</p>

  
    <div class="mx-auto mt-2 w-14 h-1 bg-footerTitle rounded-full"></div>
  </div>

  <!-- Email ve Phone bilgileri -->
  <div class="text-center mb-4">
    <p class="text-sm text-iconBoxColor">
      <span class="font-medium text-brandYellow">Email:</span> ${member.email}
    </p>
    <p class="text-sm text-iconBoxColor">
      <span class="font-medium text-brandYellow">Phone:</span> ${member.phone}
    </p>
  

<div class="flex items-center justify-center space-x-2 mt-6">
  <div class="w-8 border-t border-gray-500"></div>
  <span class="text-gray-900 text-sm">veya</span>
  <div class="w-8 border-t border-gray-500"></div>
</div>


  <div class="flex justify-center items-center gap-4 mt-6">

    <!-- Email Icon -->
    <button class="p-3 rounded-full bg-white shadow-sm hover:shadow-md flex items-center justify-center"
      onclick="window.location.href='mailto:${member.email}'" title="Email">
      <svg xmlns="http://www.w3.org/2000/svg"
        class="w-6 h-6 stroke-gray-700 hover:stroke-sky-500 transition-colors duration-300"
        fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
        <path d="M3 7l9 6 9-6" />
      </svg>
    </button>

    <!-- Call Icon -->
    <button class="p-3 rounded-full bg-white shadow-sm hover:shadow-md flex items-center justify-center"
      onclick="window.location.href='tel:${member.phone}'" title="Call">
      <svg xmlns="http://www.w3.org/2000/svg"
        class="w-6 h-6 stroke-gray-700 hover:stroke-orange-500 transition-colors duration-300"
        fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path
          d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.13 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.13-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12 1.2.37 2.38.74 3.53a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.55-1.55a2 2 0 0 1 2.11-.45c1.15.37 2.33.62 3.53.74A2 2 0 0 1 22 16.92z" />
      </svg>
    </button>

    <!-- WhatsApp Icon -->
    <button class="p-3 rounded-full bg-white shadow-sm hover:shadow-md flex items-center justify-center"
      onclick="window.location.href='https://wa.me/${member.whatsapp}'" title="WhatsApp">
      <svg xmlns="http://www.w3.org/2000/svg"
        class="w-6 h-6 text-gray-700 hover:text-[#25D366] transition-colors duration-300" viewBox="0 0 24 24"
        fill="currentColor">
        <path
          d="M20.52 3.48A11.95 11.95 0 0012 .75C6.21.75 1.5 5.46 1.5 11.25c0 1.99.52 3.83 1.43 5.46L.75 22.5l5.97-2.07A11.46 11.46 0 0012 22.5c5.79 0 10.5-4.71 10.5-10.5 0-2.83-1.09-5.43-2.98-7.02zM12 20.25a9.01 9.01 0 01-4.6-1.2l-.33-.19-3.55 1.23 1.2-3.46-.21-.36A9 9 0 1112 20.25zM17.1 14.1c-.25-.13-1.46-.72-1.69-.8-.23-.07-.4-.12-.57.12-.17.23-.66.8-.81.97-.15.17-.3.19-.55.06-.25-.12-1.06-.39-2.02-1.25-.75-.67-1.25-1.5-1.4-1.75-.15-.25-.02-.39.11-.52.11-.11.25-.3.37-.45.12-.15.16-.25.25-.42.09-.17.04-.31-.02-.44-.07-.12-.57-1.38-.78-1.89-.2-.5-.4-.44-.55-.45-.14-.01-.31-.01-.48-.01s-.44.06-.67.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.41 1.01 2.58.12.17 1.74 2.66 4.22 3.73 2.48 1.08 2.48.72 2.93.68.45-.04 1.46-.6 1.67-1.18.21-.57.21-1.06.15-1.17-.06-.12-.25-.18-.5-.31z" />
      </svg>
    </button>
  </div>
</div>


        </div>
      </div>
    </article>
  `;

  teamContainer.insertAdjacentHTML("beforeend", card);
});
