#!/usr/bin/env python3
"""
Convert MealPlanner.jfif to PNG icons of various sizes for PWA
"""

from PIL import Image
import os

# Input and output paths
input_path = os.path.join('public', 'icons', 'MealPlanner.jfif')
output_dir = os.path.join('public', 'icons')

# Icon sizes to generate
sizes = [192, 512]

# Also generate favicon sizes
favicon_sizes = [16, 32, 48]

try:
    # Open the source image
    print(f"Opening {input_path}...")
    img = Image.open(input_path)

    # Convert to RGB if needed (remove alpha channel for JPEG compatibility)
    if img.mode in ('RGBA', 'LA', 'P'):
        print("Converting to RGB...")
        background = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'P':
            img = img.convert('RGBA')
        background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
        img = background

    # Generate PWA icons
    for size in sizes:
        output_path = os.path.join(output_dir, f'icon-{size}.png')
        print(f"Creating {size}x{size} icon...")

        # Resize image maintaining aspect ratio and center crop to square
        img_copy = img.copy()

        # Make it square by center cropping
        width, height = img_copy.size
        if width != height:
            # Crop to square
            min_dim = min(width, height)
            left = (width - min_dim) // 2
            top = (height - min_dim) // 2
            right = left + min_dim
            bottom = top + min_dim
            img_copy = img_copy.crop((left, top, right, bottom))

        # Resize to target size
        img_resized = img_copy.resize((size, size), Image.Resampling.LANCZOS)

        # Save as PNG
        img_resized.save(output_path, 'PNG', optimize=True)
        print(f"[OK] Saved {output_path}")

    # Generate favicon.ico with multiple sizes
    favicon_path = os.path.join('public', 'favicon.ico')
    print(f"\nCreating favicon.ico with sizes {favicon_sizes}...")

    favicon_images = []
    for size in favicon_sizes:
        img_copy = img.copy()

        # Make it square by center cropping
        width, height = img_copy.size
        if width != height:
            min_dim = min(width, height)
            left = (width - min_dim) // 2
            top = (height - min_dim) // 2
            right = left + min_dim
            bottom = top + min_dim
            img_copy = img_copy.crop((left, top, right, bottom))

        img_resized = img_copy.resize((size, size), Image.Resampling.LANCZOS)
        favicon_images.append(img_resized)

    # Save as ICO
    favicon_images[0].save(
        favicon_path,
        format='ICO',
        sizes=[(s, s) for s in favicon_sizes],
        append_images=favicon_images[1:]
    )
    print(f"[OK] Saved {favicon_path}")

    # Also create a simple PNG favicon
    favicon_png_path = os.path.join('public', 'favicon.png')
    img_copy = img.copy()
    width, height = img_copy.size
    if width != height:
        min_dim = min(width, height)
        left = (width - min_dim) // 2
        top = (height - min_dim) // 2
        right = left + min_dim
        bottom = top + min_dim
        img_copy = img_copy.crop((left, top, right, bottom))
    img_32 = img_copy.resize((32, 32), Image.Resampling.LANCZOS)
    img_32.save(favicon_png_path, 'PNG', optimize=True)
    print(f"[OK] Saved {favicon_png_path}")

    print("\n[SUCCESS] All icons generated successfully!")
    print("\nGenerated files:")
    print("  - public/icons/icon-192.png")
    print("  - public/icons/icon-512.png")
    print("  - public/favicon.ico")
    print("  - public/favicon.png")

except FileNotFoundError:
    print(f"[ERROR] Could not find {input_path}")
    print("Please make sure MealPlanner.jfif exists in the public/icons directory")
except Exception as e:
    print(f"[ERROR] {e}")
    import traceback
    traceback.print_exc()
