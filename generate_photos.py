
import json
from pathlib import Path
from urllib.parse import quote

BASE_DIR = Path(__file__).parent
ORIGINALS_DIR = BASE_DIR / "WeddingPhotos" / "originals"
OUTPUT_FILE = BASE_DIR / "photos.json"

R2_URL = "https://pub-e73c23794e83448bbc5e4d7dcce9f82d.r2.dev"

originals = sorted(
    file for file in ORIGINALS_DIR.iterdir()
    if file.suffix.lower() in [".jpg", ".jpeg"]
)

photos = []

for index, original in enumerate(originals, start=1):
    photo = {
        "id": f"photo-{index:03}",
        "order": index,
        "webp": f"{R2_URL}/optimised/photo-{index:03}.webp",
        "original": f"{R2_URL}/originals/{quote(original.name)}",
        "thumbnail": f"{R2_URL}/thumbnails/photo-{index:03}.webp",
    }

    photos.append(photo)

with open(OUTPUT_FILE, "w", encoding="utf-8") as file:
    json.dump({"photos": photos}, file, indent=2)

print(f"Generated catalogue for {len(photos)} photographs.")
