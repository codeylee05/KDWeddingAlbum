
from pathlib import Path
from PIL import Image, ImageOps

BASE_DIR = Path(__file__).parent
INPUT_DIR = BASE_DIR / "WeddingPhotos" / "originals"
OUTPUT_DIR = BASE_DIR / "WeddingPhotos" / "optimised"

QUALITY = 92

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

photos = sorted(
    file for file in INPUT_DIR.iterdir()
    if file.suffix.lower() in [".jpg", ".jpeg"]
)

for index, photo in enumerate(photos, start=1):
    with Image.open(photo) as image:
        image = ImageOps.exif_transpose(image)
        image = image.convert("RGB")

        output_path = OUTPUT_DIR / f"photo-{index:03}.webp"

        image.save(
            output_path,
            "WEBP",
            quality=QUALITY,
            method=6
        )

    print(f"Processed {index}/{len(photos)}: {photo.name}")

print(f"\nFinished! Processed {len(photos)} photographs.")
