// main.js

document.addEventListener('DOMContentLoaded', function () {
    // Satış / Kiralama Toggle
    const saleBtn = document.getElementById('saleBtn');
    const rentBtn = document.getElementById('rentBtn');

    if (saleBtn && rentBtn) {
        saleBtn.addEventListener('click', function () {
            saleBtn.classList.add('bg-primary', 'text-white');
            saleBtn.classList.remove('text-gray-600');
            rentBtn.classList.remove('bg-primary', 'text-white');
            rentBtn.classList.add('text-gray-600');
        });

        rentBtn.addEventListener('click', function () {
            rentBtn.classList.add('bg-primary', 'text-white');
            rentBtn.classList.remove('text-gray-600');
            saleBtn.classList.remove('bg-primary', 'text-white');
            saleBtn.classList.add('text-gray-600');
        });
    }

    // Grid / Liste Görünümü Toggle
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    const gridView = document.getElementById('gridView');
    const listView = document.getElementById('listView');

    if (gridViewBtn && listViewBtn && gridView && listView) {
        gridViewBtn.addEventListener('click', function () {
            gridViewBtn.classList.add('bg-primary', 'text-white');
            gridViewBtn.classList.remove('text-gray-600');
            listViewBtn.classList.remove('bg-primary', 'text-white');
            listViewBtn.classList.add('text-gray-600');
            gridView.classList.remove('hidden');
            listView.classList.add('hidden');
        });

        listViewBtn.addEventListener('click', function () {
            listViewBtn.classList.add('bg-primary', 'text-white');
            listViewBtn.classList.remove('text-gray-600');
            gridViewBtn.classList.remove('bg-primary', 'text-white');
            gridViewBtn.classList.add('text-gray-600');
            listView.classList.remove('hidden');
            gridView.classList.add('hidden');
        });
    }

    // Kalp (Favori) Toggle
    const heartButtons = document.querySelectorAll('button i[class*="ri-heart"]');

    heartButtons.forEach(button => {
        button.parentElement.addEventListener('click', function () {
            if (button.classList.contains('ri-heart-line')) {
                button.classList.remove('ri-heart-line');
                button.classList.add('ri-heart-fill', 'text-red-500');
            } else {
                button.classList.remove('ri-heart-fill', 'text-red-500');
                button.classList.add('ri-heart-line');
            }
        });
    });
});
