 document.addEventListener('DOMContentLoaded', function() {
        const galleryThumbs = document.querySelectorAll('.gallery-thumb');
        const mainImage = document.getElementById('mainImage');
        galleryThumbs.forEach(thumb => {
            thumb.addEventListener('click', function() {
                const imgElement = this.querySelector('img');
                if (imgElement) {
                    mainImage.src = imgElement.src;
                    galleryThumbs.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                }
            });
        });
    });