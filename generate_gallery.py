import os
import json
import random
from datetime import datetime
from PIL import Image, ExifTags, ImageOps # Added ImageOps for rotation fix

# --- CONFIGURATION ---
IMAGE_FOLDER = 'images'      # Folder containing your high-res photos
THUMB_FOLDER = 'thumbnails'  # Folder where thumbnails will be generated
OUTPUT_FILE = 'data.json'    # Output file for the frontend
THUMB_SIZE = (400, 400)      # Max size for thumbnails (width, height)

# India Lat/Lon Bounds (for photos without GPS)
INDIA_BOUNDS = {
    'lat_min': 8.4, 'lat_max': 32.8,
    'lon_min': 68.7, 'lon_max': 97.25
}

def get_exif_data(image):
    """Returns a dictionary from the exif data of an PIL Image item."""
    exif_data = {}
    try:
        info = image._getexif()
        if info:
            for tag, value in info.items():
                decoded = ExifTags.TAGS.get(tag, tag)
                if decoded == "GPSInfo":
                    gps_data = {}
                    for t in value:
                        sub_decoded = ExifTags.GPSTAGS.get(t, t)
                        gps_data[sub_decoded] = value[t]
                    exif_data[decoded] = gps_data
                else:
                    exif_data[decoded] = value
    except Exception:
        pass
    return exif_data

def get_lat_lon(exif_data):
    """Returns lat/lon from EXIF data."""
    lat = None
    lon = None

    if "GPSInfo" in exif_data:
        gps_info = exif_data["GPSInfo"]

        def convert_to_degrees(value):
            d = float(value[0])
            m = float(value[1])
            s = float(value[2])
            return d + (m / 60.0) + (s / 3600.0)

        try:
            if "GPSLatitude" in gps_info and "GPSLongitude" in gps_info:
                lat = convert_to_degrees(gps_info["GPSLatitude"])
                if gps_info.get("GPSLatitudeRef") != "N": lat = -lat
                
                lon = convert_to_degrees(gps_info["GPSLongitude"])
                if gps_info.get("GPSLongitudeRef") != "E": lon = -lon
        except Exception as e:
            print(f"Error converting GPS coordinates: {e}")

    return lat, lon

def get_date_taken(exif_data):
    """Extracts date taken from EXIF, returns YYYY-MM-DD string."""
    date_str = exif_data.get("DateTimeOriginal") or exif_data.get("DateTime")
    if date_str:
        try:
            # EXIF standard format is usually "YYYY:MM:DD HH:MM:SS"
            dt = datetime.strptime(date_str, "%Y:%m:%d %H:%M:%S")
            return dt.strftime("%Y-%m-%d")
        except ValueError:
            pass
    return datetime.now().strftime("%Y-%m-%d")

def generate_thumbnail(image, filename):
    """Resizes image and saves it to thumbnails folder."""
    if not os.path.exists(THUMB_FOLDER):
        os.makedirs(THUMB_FOLDER)
    
    thumb_path = os.path.join(THUMB_FOLDER, filename)
    
    # Create copy to not modify original object
    img_copy = image.copy()
    img_copy.thumbnail(THUMB_SIZE)
    
    # Save (convert RGB to handle PNGs properly if saving as JPG)
    if img_copy.mode in ("RGBA", "P"): 
        img_copy = img_copy.convert("RGB")
        
    img_copy.save(thumb_path, "JPEG", quality=80)
    return thumb_path.replace("\\", "/") # Ensure forward slashes for web

def generate_data():
    gallery_data = []
    
    # Ensure image directory exists
    if not os.path.exists(IMAGE_FOLDER):
        os.makedirs(IMAGE_FOLDER)
        print(f"Created '{IMAGE_FOLDER}' directory. Please add .jpg/.png images there and run again.")
        return

    files = [f for f in os.listdir(IMAGE_FOLDER) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]
    print(f"Found {len(files)} images in '{IMAGE_FOLDER}'...")

    for i, filename in enumerate(files):
        filepath = os.path.join(IMAGE_FOLDER, filename)
        
        try:
            # Open the image
            img = Image.open(filepath)
            
            # 1. Extract Metadata (Do this BEFORE rotation to ensure raw EXIF is intact)
            exif = get_exif_data(img)
            lat, lon = get_lat_lon(exif)
            date_taken = get_date_taken(exif)
            
            # 2. Fix Orientation & Generate Thumbnail
            try:
                # This physically rotates the pixels based on the EXIF flag
                img_rotated = ImageOps.exif_transpose(img) 
            except Exception:
                img_rotated = img # Fallback to original if rotation fails

            thumb_path = generate_thumbnail(img_rotated, filename)
            
            # 3. Handle Coordinates (Real vs Dummy)
            if lat is None or lon is None:
                lat = random.uniform(INDIA_BOUNDS['lat_min'], INDIA_BOUNDS['lat_max'])
                lon = random.uniform(INDIA_BOUNDS['lon_min'], INDIA_BOUNDS['lon_max'])
                print(f"[{i+1}/{len(files)}] {filename}: Assigned random coords")
            else:
                print(f"[{i+1}/{len(files)}] {filename}: Found GPS data")

            # 4. Build Object (Compatible with index.html)
            gallery_data.append({
                "id": i + 1,
                "name": filename.split('.')[0].replace('-', ' ').replace('_', ' ').title(),
                "lat": lat,
                "lng": lon,
                "date": date_taken,
                "path": f"{IMAGE_FOLDER}/{filename}",
                "thumb": thumb_path
            })
            
        except Exception as e:
            print(f"Error processing {filename}: {e}")

    # Write JSON
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(gallery_data, f, indent=4)
    
    print(f"\nSuccess! Generated '{OUTPUT_FILE}' with {len(gallery_data)} items.")
    print(f"Thumbnails saved in '{THUMB_FOLDER}/'")

if __name__ == "__main__":
    generate_data()