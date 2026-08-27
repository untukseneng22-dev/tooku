// Auto high-compression untuk foto produk (client-side, tanpa upload mentah).
export type CompressResult = {
  dataUrl: string;
  originalKb: number;
  compressedKb: number;
  width: number;
  height: number;
};

const MAX_EDGE = 1000;
const TARGET_KB = 160;
const MIN_QUALITY = 0.4;

const kb = (dataUrl: string) => Math.round((dataUrl.length * 3) / 4 / 1024);

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Gagal membaca gambar"));
    };
    img.src = url;
  });
}

export async function compressImage(file: File): Promise<CompressResult> {
  const originalKb = Math.round(file.size / 1024);
  const img = await loadImage(file);

  const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
  let width = Math.max(1, Math.round(img.naturalWidth * scale));
  let height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak tersedia");

  const render = (w: number, h: number, quality: number, mime: string) => {
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL(mime, quality);
  };

  // WebP jika didukung, fallback JPEG.
  const probe = render(1, 1, 0.5, "image/webp");
  const mime = probe.startsWith("data:image/webp") ? "image/webp" : "image/jpeg";

  let quality = 0.72;
  let dataUrl = render(width, height, quality, mime);

  while (kb(dataUrl) > TARGET_KB && quality > MIN_QUALITY) {
    quality = Math.max(MIN_QUALITY, quality - 0.1);
    dataUrl = render(width, height, quality, mime);
  }
  // Masih besar: turunkan resolusi bertahap.
  let guard = 0;
  while (kb(dataUrl) > TARGET_KB && Math.max(width, height) > 480 && guard < 4) {
    width = Math.round(width * 0.8);
    height = Math.round(height * 0.8);
    dataUrl = render(width, height, quality, mime);
    guard += 1;
  }

  return { dataUrl, originalKb, compressedKb: kb(dataUrl), width, height };
}
