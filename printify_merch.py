#!/usr/bin/env python3
"""
Printify Bulk Merch Creator
============================
Takes a folder of album covers and creates merch products (shirts, hoodies, mugs) for each.

Setup:
1. Get your Printify API token from: Printify > My Profile > Connections > Generate Token
2. Set PRINTIFY_TOKEN environment variable or edit this script
3. Put your album art images in the 'album_covers' folder
4. Run: python printify_merch.py

"""

import os
import sys
import json
import base64
import requests
from pathlib import Path
from typing import Optional

# ============ CONFIGURATION ============

PRINTIFY_TOKEN = os.getenv("PRINTIFY_TOKEN", "YOUR_TOKEN_HERE")
BASE_URL = "https://api.printify.com/v1"

# Folder containing your album cover images
ALBUM_COVERS_FOLDER = "./album_covers"

# Product templates - these are common Printify blueprint IDs
# You can find more at: https://developers.printify.com/#catalog
PRODUCT_TEMPLATES = [
    {
        "name": "Unisex T-Shirt",
        "blueprint_id": 6,  # Gildan 64000
        "print_provider_id": 99,  # Common provider
        "base_price": 24.99,
        "variants": [12, 13, 14, 15, 16],  # S, M, L, XL, 2XL in black
    },
    {
        "name": "Hoodie",
        "blueprint_id": 77,  # Gildan 18500
        "print_provider_id": 99,
        "base_price": 44.99,
        "variants": [1, 2, 3, 4, 5],  # S-2XL
    },
    {
        "name": "Mug 11oz",
        "blueprint_id": 438,  # 11oz ceramic mug
        "print_provider_id": 28,
        "base_price": 14.99,
        "variants": [65139],  # White 11oz
    },
    {
        "name": "Poster",
        "blueprint_id": 49,  # Enhanced Matte Poster
        "print_provider_id": 25,
        "base_price": 19.99,
        "variants": [421],  # 18x24
    },
]

# ============ API HELPERS ============

def get_headers():
    return {
        "Authorization": f"Bearer {PRINTIFY_TOKEN}",
        "Content-Type": "application/json"
    }


def get_shop_id() -> Optional[str]:
    """Get the first shop ID from your Printify account."""
    response = requests.get(f"{BASE_URL}/shops.json", headers=get_headers())
    if response.status_code == 200:
        shops = response.json()
        if shops:
            return shops[0]["id"]
    print(f"Error getting shops: {response.text}")
    return None


def upload_image(image_path: str) -> Optional[str]:
    """Upload an image to Printify and return the image ID."""
    with open(image_path, "rb") as f:
        image_data = base64.b64encode(f.read()).decode("utf-8")
    
    filename = Path(image_path).name
    
    payload = {
        "file_name": filename,
        "contents": image_data
    }
    
    response = requests.post(
        f"{BASE_URL}/uploads/images.json",
        headers=get_headers(),
        json=payload
    )
    
    if response.status_code in [200, 201]:
        result = response.json()
        print(f"  ✓ Uploaded: {filename} -> ID: {result['id']}")
        return result["id"]
    else:
        print(f"  ✗ Failed to upload {filename}: {response.text}")
        return None


def create_product(shop_id: str, image_id: str, album_name: str, template: dict) -> bool:
    """Create a product with the given image and template."""
    
    product_title = f"{album_name} - {template['name']}"
    
    # Build variants array with pricing
    variants = []
    for variant_id in template["variants"]:
        variants.append({
            "id": variant_id,
            "price": int(template["base_price"] * 100),  # Price in cents
            "is_enabled": True
        })
    
    # Build the product payload
    payload = {
        "title": product_title,
        "description": f"Official A-RAM merch featuring the {album_name} artwork.",
        "blueprint_id": template["blueprint_id"],
        "print_provider_id": template["print_provider_id"],
        "variants": variants,
        "print_areas": [
            {
                "variant_ids": template["variants"],
                "placeholders": [
                    {
                        "position": "front",
                        "images": [
                            {
                                "id": image_id,
                                "x": 0.5,
                                "y": 0.5,
                                "scale": 1,
                                "angle": 0
                            }
                        ]
                    }
                ]
            }
        ]
    }
    
    response = requests.post(
        f"{BASE_URL}/shops/{shop_id}/products.json",
        headers=get_headers(),
        json=payload
    )
    
    if response.status_code in [200, 201]:
        result = response.json()
        print(f"  ✓ Created: {product_title} (ID: {result['id']})")
        return True
    else:
        print(f"  ✗ Failed to create {product_title}: {response.text}")
        return False


def get_available_blueprints():
    """List available product blueprints (for reference)."""
    response = requests.get(f"{BASE_URL}/catalog/blueprints.json", headers=get_headers())
    if response.status_code == 200:
        blueprints = response.json()
        print("\n📦 Available Blueprints:")
        for bp in blueprints[:20]:  # First 20
            print(f"  {bp['id']}: {bp['title']}")


# ============ MAIN ============

def main():
    print("=" * 50)
    print("🎨 Printify Bulk Merch Creator")
    print("=" * 50)
    
    # Check token
    if PRINTIFY_TOKEN == "YOUR_TOKEN_HERE":
        print("\n❌ Please set your Printify API token!")
        print("   1. Go to Printify > My Profile > Connections")
        print("   2. Generate a Personal Access Token")
        print("   3. Set PRINTIFY_TOKEN environment variable or edit this script")
        sys.exit(1)
    
    # Get shop ID
    shop_id = get_shop_id()
    if not shop_id:
        print("❌ Could not get shop ID. Check your API token.")
        sys.exit(1)
    print(f"\n✓ Using shop ID: {shop_id}")
    
    # Check for album covers folder
    covers_path = Path(ALBUM_COVERS_FOLDER)
    if not covers_path.exists():
        covers_path.mkdir()
        print(f"\n📁 Created folder: {ALBUM_COVERS_FOLDER}")
        print("   Add your album cover images there and run again!")
        sys.exit(0)
    
    # Find images
    image_extensions = {".jpg", ".jpeg", ".png", ".webp"}
    images = [f for f in covers_path.iterdir() if f.suffix.lower() in image_extensions]
    
    if not images:
        print(f"\n❌ No images found in {ALBUM_COVERS_FOLDER}")
        print("   Supported formats: JPG, PNG, WebP")
        sys.exit(1)
    
    print(f"\n📷 Found {len(images)} album cover(s)")
    
    # Process each image
    total_created = 0
    for image_path in images:
        album_name = image_path.stem.replace("_", " ").replace("-", " ").title()
        print(f"\n🎵 Processing: {album_name}")
        
        # Upload image
        image_id = upload_image(str(image_path))
        if not image_id:
            continue
        
        # Create products for each template
        for template in PRODUCT_TEMPLATES:
            if create_product(shop_id, image_id, album_name, template):
                total_created += 1
    
    print("\n" + "=" * 50)
    print(f"✅ Done! Created {total_created} products")
    print("   Go to Printify to review and publish them!")
    print("=" * 50)


if __name__ == "__main__":
    main()
