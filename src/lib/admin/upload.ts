import { saveMediaFileFn } from "@/lib/admin-queries";

/**
 * Uploads media without any external storage dependency.
 * Compresses the image and saves as static file in public/uploads/
 * Returning clean static URL: /uploads/...
 */
export async function uploadMedia(
  file: File,
  _folder = "uploads",
): Promise<string> {
  const base64Url: string = await new Promise((resolve, reject) => {
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
        const MAX_WIDTH = 900;
        const MAX_HEIGHT = 900;
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
        // Compress as JPEG 0.78 quality (~40KB)
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.78);
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

  if (base64Url && base64Url.startsWith("data:image/")) {
    try {
      const cleanName = (file.name || "upload")
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "");
      const res = await saveMediaFileFn({
        data: {
          base64: base64Url,
          filename: `${cleanName}-${Date.now()}`,
        },
      });
      if (res?.url) return res.url;
    } catch (e) {
      console.warn("Failed to save media file to server disk, using base64 fallback:", e);
    }
  }

  return base64Url;
}
