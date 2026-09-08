import os
from PIL import Image, ImageOps

source_path = r"C:\Users\SOUVIK\.gemini\antigravity\brain\e2af0ea6-c0b1-4f06-b730-191c82ac1715\media__1788882138272.png"
public_dir = r"d:\Development\Projects\TEAM PROJECTS\BF\BharatFarm-main_MIGRATED_FINAL\BharatFarm-main\client\public"
icons_dir = os.path.join(public_dir, "icons")

os.makedirs(icons_dir, exist_ok=True)

img = Image.open(source_path).convert("RGBA")

# Standard sizes
sizes = {
    "icon-32.png": 32,
    "icon-96.png": 96,
    "icon-144.png": 144,
    "icon-192.png": 192,
    "icon-384.png": 384,
    "icon-512.png": 512,
    "apple-touch-icon.png": 180,
}

for name, size in sizes.items():
    resized = img.resize((size, size), Image.Resampling.LANCZOS)
    out_path = os.path.join(icons_dir, name)
    resized.save(out_path, "PNG")
    print(f"Generated {out_path} ({size}x{size})")

# Maskable icons (10% padding around original logo on white background for Android adaptive icon format)
def make_maskable(source_img, target_size):
    # Standard maskable safe zone is inner 80% (10% padding on each side)
    canvas = Image.new("RGBA", (target_size, target_size), (255, 255, 255, 255))
    inner_size = int(target_size * 0.85)
    inner_img = source_img.resize((inner_size, inner_size), Image.Resampling.LANCZOS)
    offset = (target_size - inner_size) // 2
    canvas.paste(inner_img, (offset, offset), inner_img)
    return canvas

maskable_192 = make_maskable(img, 192)
maskable_192.save(os.path.join(icons_dir, "icon-192-maskable.png"), "PNG")

maskable_512 = make_maskable(img, 512)
maskable_512.save(os.path.join(icons_dir, "icon-512-maskable.png"), "PNG")

# Root public icons
img.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(public_dir, "favicon.png"), "PNG")
img.resize((16, 16), Image.Resampling.LANCZOS).save(os.path.join(public_dir, "favicon-16.png"), "PNG")
img.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(public_dir, "logo.png"), "PNG")

print("All icons successfully generated!")
