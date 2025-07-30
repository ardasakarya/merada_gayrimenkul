

const galleryImages = [

    "https://readdy.ai/api/search-image?query=modern%20luxury%20villa%20garden%20with%20swimming%20pool%2C%20landscaped%20garden%2C%20outdoor%20seating%20area%2C%20Bosphorus%20view%2C%20luxury%20lifestyle&width=200&height=200&seq=5&orientation=squarish",

    "https://readdy.ai/api/search-image?query=modern%20luxury%20villa%20interior%20with%20large%20windows%2C%20minimalist%20design%2C%20bright%20and%20spacious%20living%20room%20with%20panoramic%20view%20of%20Bosphorus%2C%20high-end%20finishes%2C%20natural%20light%2C%20contemporary%20architecture&width=800&height=600&seq=1&orientation=landscape",
    "https://readdy.ai/api/search-image?query=modern%20luxury%20villa%20garden%20with%20swimming%20pool%2C%20landscaped%20garden%2C%20outdoor%20seating%20area%2C%20Bosphorus%20view%2C%20luxury%20lifestyle&width=200&height=200&seq=5&orientation=squarish",
    "https://readdy.ai/api/search-image?query=modern%20luxury%20villa%20bedroom%20with%20panoramic%20windows%2C%20king%20size%20bed%2C%20minimalist%20furniture%2C%20neutral%20colors%2C%20elegant%20design&width=200&height=200&seq=3&orientation=squarish",
    "https://readdy.ai/api/search-image?query=modern%20luxury%20villa%20interior%20with%20large%20windows%2C%20minimalist%20design%2C%20bright%20and%20spacious%20living%20room%20with%20panoramic%20view%20of%20Bosphorus%2C%20high-end%20finishes%2C%20natural%20light%2C%20contemporary%20architecture&width=800&height=600&seq=1&orientation=landscape",
    "https://readdy.ai/api/search-image?query=modern%20luxury%20villa%20garden%20with%20swimming%20pool%2C%20landscaped%20garden%2C%20outdoor%20seating%20area%2C%20Bosphorus%20view%2C%20luxury%20lifestyle&width=200&height=200&seq=5&orientation=squarish",

    "https://readdy.ai/api/search-image?query=modern%20luxury%20villa%20interior%20with%20large%20windows%2C%20minimalist%20design%2C%20bright%20and%20spacious%20living%20room%20with%20panoramic%20view%20of%20Bosphorus%2C%20high-end%20finishes%2C%20natural%20light%2C%20contemporary%20architecture&width=800&height=600&seq=1&orientation=landscape",





];

let currentImageIndex = 0;

function setMainImage(element, index) {
    const mainImage = document.getElementById("mainImage");
    if (mainImage && element) {
        mainImage.src = element.src;
    }
}

function openGalleryPopup(index = 0) {
    currentImageIndex = index;
    updateSliderImage();
    document.getElementById('galleryPopup').classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
}

function closeGalleryPopup() {
    document.getElementById('galleryPopup').classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
}

function updateSliderImage() {
    const imgElement = document.getElementById('sliderImage');
    imgElement.src = galleryImages[currentImageIndex];
}

function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    updateSliderImage();
}

function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    updateSliderImage();
}




document.addEventListener('DOMContentLoaded', function () {
    const galleryThumbs = document.querySelectorAll('.gallery-thumb');
    const mainImage = document.getElementById('mainImage');
    galleryThumbs.forEach(thumb => {
        thumb.addEventListener('click', function () {
            const imgElement = this.querySelector('img');
            if (imgElement) {
                mainImage.src = imgElement.src;
                galleryThumbs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
});

