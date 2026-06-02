#!/usr/bin/env python3
"""Create sample product images"""
import os
import sys

try:
    from PIL import Image, ImageDraw
except ImportError:
    print("ERROR: Pillow not installed. Installing...")
    os.system(f"{sys.executable} -m pip install Pillow -q")
    from PIL import Image, ImageDraw

# Product images config
product_dir = os.path.abspath(os.path.join(
    os.path.dirname(__file__), 
    "..", "backend", "uploads", "products"
))
os.makedirs(product_dir, exist_ok=True)

products = [
    {"name": "Áo Thun Nam Cotton", "color": (255, 107, 107)},      # Red
    {"name": "Laptop Dell XPS", "color": (78, 205, 196)},           # Teal
    {"name": "Giày Nike Chạy Bộ", "color": (255, 217, 61)},        # Yellow
    {"name": "Sách Harry Potter", "color": (108, 92, 231)},         # Purple
    {"name": "Son Môi Đỏ", "color": (255, 23, 68)},                # Bright Red
    {"name": "Tai Nghe Bluetooth", "color": (0, 188, 212)},        # Cyan
    {"name": "Smartwatch Apple", "color": (51, 51, 51)},           # Dark
    {"name": "Kem Dưỡng Da", "color": (255, 192, 203)},            # Pink
]

for idx, product in enumerate(products, 1):
    # Create image
    img = Image.new('RGB', (400, 400), color=product["color"])
    draw = ImageDraw.Draw(img)
    
    # Add text
    text = product["name"]
    bbox = draw.textbbox((0, 0), text)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (400 - text_width) // 2
    y = (400 - text_height) // 2
    
    draw.text((x, y), text, fill=(255, 255, 255))
    
    # Save
    filename = f"sample_product_{idx}.jpg"
    filepath = os.path.join(product_dir, filename)
    img.save(filepath, "JPEG", quality=85)
    print(f"✅ {filename}")

print(f"\n✨ Created {len(products)} sample product images in {product_dir}")
