


const photos = [
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=85",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=85",
    "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1200&q=85",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=1200&q=85"
];

const landing = document.getElementById('landing');
const slideshow = document.getElementById('slideshow');

const photoA = document.getElementById('photoA');
const photoB = document.getElementById('photoB');

const enterButton = document.getElementById('enterButton');
const closeButton = document.getElementById('closeButton');
const previousButton = document.getElementById('previousButton');
const nextButton = document.getElementById('nextButton');
const pauseButton = document.getElementById('pauseButton');

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
        preloadPhoto(photos[index]).catch(() => { });
    }
}

async function showPhoto(index) {
    const thisRequest = ++requestId;
    const url = photos[index];

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
    stopTimer();
    resetTimer();

    const nextIndex = (currentIndex + 1) % photos.length;

    await showPhoto(nextIndex);

    if (isPlaying) startTimer();
}

async function previousPhoto() {
    stopTimer();
    resetTimer();

    const previousIndex =
        (currentIndex - 1 + photos.length) % photos.length;

    await showPhoto(previousIndex);

    if (isPlaying) startTimer();
}

async function enterSlideshow() {
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
