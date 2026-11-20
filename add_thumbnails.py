'''THIS FILE ALLOWS THUMBNAILS TO BE ADDED TO THE JSON FILE. IT IS NOT USED IN THE FINAL PROJECT.'''

import json
from pathlib import Path

R2_URL = "https://pub-e73c23794e83448bbc5e4d7dcce9f82d.r2.dev"

json_path = Path("photos.json")

with json_path.open("r", encoding="utf-8") as file:
    data = json.load(file)

for photo in data["photos"]:
    photo_number = photo["id"]

    photo["thumbnail"] = (
        f"{R2_URL}/thumbnails/{photo_number:03}.webp"
    )

with json_path.open("w", encoding="utf-8") as file:
    json.dump(data, file, indent=4)

print(f"Updated {len(data['photos'])} photos.")
