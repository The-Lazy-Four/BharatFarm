#!/usr/bin/env python3
"""
Generate BharatFarm PWA icons from the source icon image.
"""

from PIL import Image
import os

SOURCE_ICON = r"C:\Users\SOUVIK\.gemini\antigravity\brain\c11eaaba-ae6a-4cbf-934f-5cb147e6e787\media__1788860176221.jpg"
OUTPUT_DIR = r"d:\Development\Projects\TEAM PROJECTS\BF\BharatFarm-main_MIGRATED_FINAL\BharatFarm-main\client\public\icons"

os.makedirs(OUTPUT_DIR, exist_ok=True)

src = Image.open(SOURCE_ICON).convert("RGBA")
print(f"Source image size: {src.size}, mode: {src.mode}")

def make_icon(img, size, output_path):
    resized = img.resize((size, size), Image.LANCZOS)
    resized.save(output_path, format="PNG", optimize=True)
    print(f"Saved: {output_path} ({size}x{size})")

def make_maskable_icon(img, size, output_path, padding_fraction=0.15):
    bg_color = (13, 77, 26, 255)
    canvas = Image.new("RGBA", (size, size), bg_color)
    icon_size = int(size * (1 - 2 * padding_fraction))
    resized = img.resize((icon_size, icon_size), Image.LANCZOS)
    pad = (size - icon_size) // 2
    canvas.paste(resized, (pad, pad), resized)
    canvas.save(output_path, format="PNG", optimize=True)
    print(f"Saved maskable: {output_path} ({size}x{size}, icon={icon_size}x{icon_size})")

make_icon(src, 32, os.path.join(OUTPUT_DIR, "icon-32.png"))
make_icon(src, 96, os.path.join(OUTPUT_DIR, "icon-96.png"))
make_icon(src, 144, os.path.join(OUTPUT_DIR, "icon-144.png"))
make_icon(src, 192, os.path.join(OUTPUT_DIR, "icon-192.png"))
make_icon(src, 384, os.path.join(OUTPUT_DIR, "icon-384.png"))
make_icon(src, 512, os.path.join(OUTPUT_DIR, "icon-512.png"))
make_icon(src, 180, os.path.join(OUTPUT_DIR, "apple-touch-icon.png"))
make_maskable_icon(src, 192, os.path.join(OUTPUT_DIR, "icon-192-maskable.png"), 0.15)
make_maskable_icon(src, 512, os.path.join(OUTPUT_DIR, "icon-512-maskable.png"), 0.15)

public_dir = r"d:\Development\Projects\TEAM PROJECTS\BF\BharatFarm-main_MIGRATED_FINAL\BharatFarm-main\client\public"
make_icon(src, 32, os.path.join(public_dir, "favicon.png"))
make_icon(src, 16, os.path.join(public_dir, "favicon-16.png"))

print("\nAll PWA icons generated successfully!")
