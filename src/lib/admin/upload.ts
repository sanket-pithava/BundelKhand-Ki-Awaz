/**
 * Uploads media without any external storage dependency.
 * Compresses the image to high-quality web-ready dimensions (max 1280px, 82% quality)
 * and returns the optimized Data URL to be stored directly in MongoDB.
 */
export async function uploadMedia(
  file: File,
  _folder = "uploads",
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If it's not an image (e.g. video/pdf), read as standard data URL
    if (!file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1280;
        const MAX_HEIGHT = 1280;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(e.target?.result as string);
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Compress as JPEG 0.82 quality (~80KB-140KB)
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.82);
        resolve(compressedDataUrl);
      };
      img.onerror = () => {
        resolve(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
