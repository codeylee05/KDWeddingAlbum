
const photoGrid = document.getElementById('photoGrid');

async function loadGallery() {
    try {
        const response = await fetch('./photos.json');

        if (!response.ok) {
            throw new Error('Could not load photos');
        }

        const data = await response.json();

        data.photos.forEach((photo) => {
            const img = document.createElement('img');

            img.src = photo.thumbnail;
            img.alt = 'Wedding photograph';
            img.loading = 'lazy';
            img.decoding = 'async';

            img.addEventListener('click', () => {
                window.location.href = `index.html?photo=${encodeURIComponent(photo.id)}`;
            });

            photoGrid.appendChild(img);
        });

    } catch (error) {
        photoGrid.textContent = 'Unable to load photographs.';
    }
}

loadGallery();
