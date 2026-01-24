// =============================
// Form Interactions
// =============================
document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const inputs = form.querySelectorAll('input, textarea');

    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function () {
            this.parentElement.classList.remove('focused');
        });
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const button = this.querySelector('button[type="submit"]');
        const originalText = button.innerHTML;

        button.innerHTML = '<i class="ri-loader-4-line animate-spin mr-2"></i>Gönderiliyor...';
        button.disabled = true;

        setTimeout(() => {
            button.innerHTML = '<i class="ri-check-line mr-2"></i>Gönderildi!';
            button.classList.add('bg-green-500');

            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
                button.classList.remove('bg-green-500');
                form.reset();
            }, 2000);
        }, 1500);
    });
});

// =============================
// Social Media Interactions
// =============================
document.addEventListener('DOMContentLoaded', function () {
    const socialIcons = document.querySelectorAll('.social-glow');

    socialIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function () {
            this.style.boxShadow = '0 0 30px rgba(0, 123, 255, 0.5)';
        });

        icon.addEventListener('mouseleave', function () {
            this.style.boxShadow = '0 0 20px rgba(0, 123, 255, 0.3)';
        });

        icon.addEventListener('click', function () {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
});

// =============================
// Scroll Animations
// =============================
document.addEventListener('DOMContentLoaded', function () {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.hover-lift');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});


 const slider = document.getElementById("addressSlider");
  const totalSlides = slider.children.length;
  let index = 0;

  function updateSlide() {
    slider.style.transform = `translateX(-${index * 100}%)`;
  }

  function nextSlide() {
    index = (index + 1) % totalSlides;
    updateSlide();
  }

  function prevSlide() {
    index = (index - 1 + totalSlides) % totalSlides;
    updateSlide();
  }

  // Otomatik geçiş (5 saniye)
  setInterval(nextSlide, 5000);