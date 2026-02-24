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
    name: "Onur Özdamar",
    title: "Kurucu",
    description: "Merada Gayrimenkul’ün kurucusu olarak şirketin vizyonunu ve stratejik yönünü belirlemektedir.",
    image: "img/placeholder.png",
    email: "onur@merada.com.tr",
    phone: "+90 (540) 328 00 33",
    whatsapp: "+905403280033"
  },
  {
    name: "Taha Deniz",
    title: "Gayrimenkul Danışmanı",
    description: "Müşteri memnuniyeti odaklı yaklaşımıyla konut ve yatırım süreçlerinde profesyonel danışmanlık sunar.",
    image: "img/placeholder.png",
    email: "taha@meradagayrimenkul.com",
    phone: "+90 (532) 163 64 48",
    whatsapp: "+905321636448"
  },
  {
    name: "İsmail Danışan",
    title: "Gayrimenkul Danışmanı",
    description: "Satın alma ve satış süreçlerinde güvenilir ve şeffaf çözümler sunar.",
    image: "img/placeholder.png",
    email: "ismail@meradagayrimenkul.com",
    phone: "+90 (552) 380 23 13",
    whatsapp: "+905523802313"
  },
  {
    name: "Mahir Şenel",
    title: "Gayrimenkul Danışmanı",
    description: "Yatırım ve portföy yönetimi alanlarında uzmanlaşmıştır.",
    image: "img/placeholder.png",
    email: "mahir@meradagayrimenkul.com",
    phone: "+90 (535) 252 92 71",
    whatsapp: "+905352529271"
  },
  {
    name: "Mücahit Danışan",
    title: "Gayrimenkul Danışmanı",
    description: "Alıcı ve satıcılar arasında güvene dayalı köprü kurar.",
    image: "img/placeholder.png",
    email: "mücahit@meradagayrimenkul.com",
    phone: "+90 (537) 606 33 13",
    whatsapp: "+905376063313"
  },
  {
    name: "Beyza Güngör",
    title: "Ön Büro",
    description: "Ofis operasyonları ve müşteri iletişiminden sorumludur.",
    image: "img/placeholder.png",
    email: "beyza@meradagayrimenkul.com",
    phone: "+90 (506) 033 07 33",
    whatsapp: "+905060330733"
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



