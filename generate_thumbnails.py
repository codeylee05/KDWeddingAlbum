'''THIS FILE GENERATES THUMBNAILS FOR THE WEDDING PHOTOS. IT IS NOT USED IN THE FINAL PROJECT.'''


from PIL import Image, ImageOps
from pathlib import Path

BASE_DIR = Path(__file__).parent
INPUT_DIR = BASE_DIR / "WeddingPhotos" / "originals"
OUTPUT_DIR = BASE_DIR / "WeddingPhotos" / "thumbnails"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

files = sorted(
    file for file in INPUT_DIR.iterdir()
    if file.suffix.lower() in [".jpg", ".jpeg"]
)

for index, file in enumerate(files, start=1):
    image = Image.open(file)
    image = ImageOps.exif_transpose(image)
    image.thumbnail((400, 400), Image.Resampling.LANCZOS)

    if image.mode != "RGB":
        image = image.convert("RGB")

    image.save(
        OUTPUT_DIR / f"photo-{index:03}.webp",
        "WEBP",
        quality=75,
        method=6
    )

print(f"Generated {len(files)} thumbnails.")

print(f"Saved to: {OUTPUT_DIR.resolve()}")
