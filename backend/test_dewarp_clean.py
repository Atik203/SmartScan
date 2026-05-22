import cv2
import numpy as np
import os
import glob

def clean_and_crop_dewarped_image(image_path, output_path):
    print(f"Processing {image_path}...")
    img = cv2.imread(image_path)
    if img is None:
        print(f"Failed to read {image_path}")
        return

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img

    # Threshold to binary (ensure paper is 255, ink/borders are 0)
    _, thresh = cv2.threshold(gray, 180, 255, cv2.THRESH_BINARY)

    # Find external contours
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours:
        print("No contours found.")
        return

    # Find the largest contour by area
    largest_contour = max(contours, key=cv2.contourArea)

    # Bounding box of the largest contour
    x, y, w, h = cv2.boundingRect(largest_contour)
    img_h, img_w = img.shape[:2]

    # Validate that the contour is of reasonable size
    if w < img_w * 0.3 or h < img_h * 0.3:
        print(f"Largest contour is too small: {w}x{h} for image size {img_w}x{img_h}")
        return

    # Create mask of the page contour
    mask = np.zeros_like(gray)
    cv2.drawContours(mask, [largest_contour], -1, 255, -1)

    # Set all pixels outside the page contour to white (255)
    cleaned_img = img.copy()
    cleaned_img[mask == 0] = 255

    # Crop to the bounding rect of the page with a tiny padding
    pad = 10
    x1 = max(0, x + pad)
    y1 = max(0, y + pad)
    x2 = min(img_w, x + w - pad)
    y2 = min(img_h, y + h - pad)

    if x2 > x1 and y2 > y1:
        cropped = cleaned_img[y1:y2, x1:x2]
        cv2.imwrite(output_path, cropped)
        print(f"Successfully cleaned and cropped to {output_path} (size: {cropped.shape[1]}x{cropped.shape[0]})")
    else:
        cv2.imwrite(output_path, cleaned_img)
        print(f"Cleaned and saved to {output_path} (no cropping)")

if __name__ == "__main__":
    dewarped_dir = os.path.join("static", "dewarped")
    images = glob.glob(os.path.join(dewarped_dir, "*.png"))
    for img_path in images:
        if "_clean" in img_path:
            continue
        out_path = img_path.replace(".png", "_clean.png")
        clean_and_crop_dewarped_image(img_path, out_path)
