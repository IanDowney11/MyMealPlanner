/**
 * Image utility functions for resizing and optimizing images
 */

/**
 * Resize an image to a maximum file size
 * @param {string} dataUrl - The image data URL
 * @param {number} maxSizeKB - Maximum size in kilobytes (default: 100)
 * @returns {Promise<string>} - Resized image data URL
 */
export async function resizeImageToMaxSize(dataUrl, maxSizeKB = 100) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        // Start with full quality
        let quality = 0.9;
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');

        // Calculate initial dimensions (max 1920x1920 to start)
        let width = img.width;
        let height = img.height;
        const maxDimension = 1920;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        // Function to get current size in KB
        const getDataUrlSizeKB = (url) => {
          // Remove data URL prefix to get base64 string
          const base64 = url.split(',')[1];
          // Calculate size: base64 is ~4/3 the size of binary
          return (base64.length * 3) / 4 / 1024;
        };

        // Iteratively reduce quality and/or dimensions until under max size
        let result = dataUrl;
        let attempts = 0;
        const maxAttempts = 15;

        while (getDataUrlSizeKB(result) > maxSizeKB && attempts < maxAttempts) {
          attempts++;

          // Reduce quality first
          if (quality > 0.5) {
            quality -= 0.1;
          } else {
            // If quality is already low, reduce dimensions
            width *= 0.9;
            height *= 0.9;
            quality = 0.85; // Reset quality when reducing dimensions
          }

          // Set canvas size
          canvas.width = width;
          canvas.height = height;

          // Clear and draw image
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to JPEG (better compression than PNG for photos)
          result = canvas.toDataURL('image/jpeg', quality);
        }

        const finalSizeKB = getDataUrlSizeKB(result);
        console.log(`Image resized: ${getDataUrlSizeKB(dataUrl).toFixed(2)}KB -> ${finalSizeKB.toFixed(2)}KB (${width.toFixed(0)}x${height.toFixed(0)}, quality: ${quality.toFixed(2)})`);

        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = dataUrl;
  });
}

/**
 * Convert a File object to a data URL and resize it
 * @param {File} file - The image file
 * @param {number} maxSizeKB - Maximum size in kilobytes (default: 100)
 * @returns {Promise<string>} - Resized image data URL
 */
export async function processImageFile(file, maxSizeKB = 100) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const dataUrl = event.target.result;
        const resizedDataUrl = await resizeImageToMaxSize(dataUrl, maxSizeKB);
        resolve(resizedDataUrl);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}
