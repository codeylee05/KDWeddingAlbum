
let photos = [];

const landing = document.getElementById('landing');
const slideshow = document.getElementById('slideshow');

const photoA = document.getElementById('photoA');
const photoB = document.getElementById('photoB');

const enterButton = document.getElementById('enterButton');
const closeButton = document.getElementById('closeButton');
const previousButton = document.getElementById('previousButton');
const nextButton = document.getElementById('nextButton');
const pauseButton = document.getElementById('pauseButton');
const downloadButton = document.getElementById("downloadButton");

const photoCounter = document.getElementById('photoCounter');
const progressBar = document.getElementById('progressBar');

let currentIndex = 0;
let activeImage = photoA;
let isPlaying = true;
let elapsed = 0;
let timer = null;
let requestId = 0;

const duration = 5000;
const imageCache = new Map();

const enterButtonLabel = enterButton.textContent;

enterButton.disabled = true;
enterButton.textContent = 'Loading photos...';

async function loadPhotos() {
    try {
        const response = await fetch('./photos.json');

        if (!response.ok) {
            throw new Error('Could not load photos.json');
        }

        const data = await response.json();

        photos = data.photos;

        if (photos.length === 0) {
            throw new Error('No photographs found');
        }

        enterButton.disabled = false;
        enterButton.textContent = enterButtonLabel;

        photoCounter.textContent = `0 / ${photos.length}`;

        console.log(`Loaded ${photos.length} photographs.`);

    } catch (error) {
        console.error(error);
        enterButton.textContent = 'Unable to load photos';
    }
}

function preloadPhoto(url) {
    if (imageCache.has(url)) {
        return imageCache.get(url);
    }

    const promise = new Promise((resolve, reject) => {
        const image = new Image();

        image.onload = () => resolve(url);
        image.onerror = reject;

        image.src = url;

        if (image.complete && image.naturalWidth > 0) {
            resolve(url);
        }
    });

    imageCache.set(url, promise);

    return promise;
}

function preloadUpcoming() {
    for (let i = 1; i <= 3; i++) {
        const index = (currentIndex + i) % photos.length;
        preloadPhoto(photos[index].webp).catch(() => { });
    }
}

async function showPhoto(index) {
    const thisRequest = ++requestId;
    const url = photos[index].webp;

    try {
        await preloadPhoto(url);
    } catch {
        if (thisRequest === requestId) {
            photoCounter.textContent = 'Image unavailable';
        }
        return;
    }

    if (thisRequest !== requestId) return;

    const nextImage = activeImage === photoA ? photoB : photoA;

    nextImage.src = url;
    nextImage.classList.add('active');
    activeImage.classList.remove('active');

    activeImage = nextImage;
    currentIndex = index;

    photoCounter.textContent = `${currentIndex + 1} / ${photos.length}`;

    preloadUpcoming();
}

async function downloadPhoto() {
    const url = photos[currentIndex].original;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Download failed');
        }

        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `wedding-photo-${currentIndex + 1}.jpg`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(downloadUrl);
    } catch (error) {
        alert('Unable to download this photo. Please try again.');
    }
}

function resetTimer() {
    elapsed = 0;
    progressBar.style.width = '0%';
}

function stopTimer() {
    clearInterval(timer);
    timer = null;
}

function startTimer() {
    stopTimer();

    if (!isPlaying) return;

    timer = setInterval(() => {
        elapsed += 50;

        progressBar.style.width =
            `${Math.min((elapsed / duration) * 100, 100)}%`;

        if (elapsed >= duration) {
            nextPhoto();
        }
    }, 50);
}

async function nextPhoto() {
    if (!photos.length) return;

    stopTimer();
    resetTimer();

    const nextIndex = (currentIndex + 1) % photos.length;

    await showPhoto(nextIndex);

    if (isPlaying) startTimer();
}

async function previousPhoto() {
    if (!photos.length) return;

    stopTimer();
    resetTimer();

    const previousIndex =
        (currentIndex - 1 + photos.length) % photos.length;

    await showPhoto(previousIndex);

    if (isPlaying) startTimer();
}

async function enterSlideshow() {
    if (!photos.length) return;

    landing.classList.add('hidden');
    slideshow.classList.remove('hidden');

    isPlaying = true;
    pauseButton.textContent = 'Ⅱ';

    await showPhoto(0);

    preloadUpcoming();
    startTimer();
}

function togglePause() {
    isPlaying = !isPlaying;

    pauseButton.textContent = isPlaying ? 'Ⅱ' : '▶';

    if (isPlaying) {
        startTimer();
    } else {
        stopTimer();
    }
}

function closeSlideshow() {
    stopTimer();

    slideshow.classList.add('hidden');
    landing.classList.remove('hidden');

    resetTimer();
}

enterButton.addEventListener('click', enterSlideshow);
nextButton.addEventListener('click', nextPhoto);
previousButton.addEventListener('click', previousPhoto);
pauseButton.addEventListener('click', togglePause);
closeButton.addEventListener('click', closeSlideshow);

downloadButton.addEventListener('click', downloadPhoto);

let touchStartX = 0;

slideshow.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].screenX;
}, { passive: true });

slideshow.addEventListener('touchend', (event) => {
    const touchEndX = event.changedTouches[0].screenX;
    const difference = touchStartX - touchEndX;

    if (Math.abs(difference) < 50) return;

    if (difference > 0) {
        nextPhoto();
    } else {
        previousPhoto();
    }
}, { passive: true });

loadPhotos();
