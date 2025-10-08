from PIL import Image
import os

# Folder where this script (and the images) are located
image_folder = os.path.dirname(os.path.abspath(__file__))

# Desired output size
target_size = (512, 512)


def resize_images(folder):
    for filename in os.listdir(folder):
        if filename.lower().endswith(".png"):
            filepath = os.path.join(folder, filename)
            try:
                with Image.open(filepath) as img:
                    # Preserve alpha channel if present
                    if img.mode != "RGBA":
                        img = img.convert("RGBA")

                    img_resized = img.resize(target_size, Image.Resampling.LANCZOS)
                    img_resized.save(filepath, format="PNG")
                    print(f"✅ Resized (preserved transparency): {filename}")
            except Exception as e:
                print(f"⚠️ Error resizing {filename}: {e}")


if __name__ == "__main__":
    resize_images(image_folder)
    print("\n🎉 Done! All PNGs resized to 512x512 pixels with transparency preserved.")
