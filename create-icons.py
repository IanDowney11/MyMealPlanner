#!/usr/bin/env python3
"""
Simple script to create PWA icons for the Meal Planner app.
Requires PIL (pip install Pillow)
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os

    def create_icon(size, filename):
        # Create a new image with rounded rectangle background
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)

        # Draw rounded rectangle background
        margin = size // 8
        draw.rounded_rectangle(
            [margin, margin, size - margin, size - margin],
            radius=size // 10,
            fill='#1a1d29'
        )

        # Draw white inner background
        inner_margin = size // 4
        draw.rounded_rectangle(
            [inner_margin, inner_margin, size - inner_margin, size - inner_margin],
            radius=size // 20,
            fill='white'
        )

        # Try to add text (emoji might not work in all environments)
        try:
            # Use system font for text
            font_size = size // 6
            # Try to load a font, fall back to default if not found
            try:
                font = ImageFont.truetype("arial.ttf", font_size)
            except:
                font = ImageFont.load_default()

            # Draw "MP" text for Meal Planner
            text = "MP"
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]

            x = (size - text_width) // 2
            y = (size - text_height) // 2 - size // 20

            draw.text((x, y), text, fill='#1a1d29', font=font)

        except Exception as e:
            print(f"Could not add text: {e}")
            # Draw a simple circle as fallback
            center = size // 2
            radius = size // 8
            draw.ellipse(
                [center - radius, center - radius, center + radius, center + radius],
                fill='#1a1d29'
            )

        # Save the image
        img.save(filename, 'PNG')
        print(f"Created {filename} ({size}x{size})")

    # Create icons directory
    icons_dir = "public/icons"
    os.makedirs(icons_dir, exist_ok=True)

    # Create icons
    create_icon(192, f"{icons_dir}/icon-192.png")
    create_icon(512, f"{icons_dir}/icon-512.png")

    print("PWA icons created successfully!")

except ImportError:
    print("PIL not available. Creating simple placeholder files...")

    # Create minimal placeholder files
    import os

    # Create simple SVG as fallback
    svg_content = '''<svg width="{size}" height="{size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="{size}" height="{size}" fill="#1a1d29" rx="{radius}"/>
        <rect x="{margin}" y="{margin}" width="{inner}" height="{inner}" fill="#ffffff" rx="{inner_radius}"/>
        <text x="{size_half}" y="{text_y}" font-family="Arial" font-size="{font_size}" font-weight="bold" text-anchor="middle" fill="#1a1d29">MP</text>
    </svg>'''

    icons_dir = "public/icons"
    os.makedirs(icons_dir, exist_ok=True)

    for size in [192, 512]:
        margin = size // 4
        svg = svg_content.format(
            size=size,
            radius=size // 10,
            margin=margin,
            inner=size - 2 * margin,
            inner_radius=size // 20,
            size_half=size // 2,
            text_y=size // 2 + size // 16,
            font_size=size // 6
        )

        filename = f"{icons_dir}/icon-{size}.svg"
        with open(filename, 'w') as f:
            f.write(svg)
        print(f"Created {filename}")

    print("SVG icons created as fallback!")