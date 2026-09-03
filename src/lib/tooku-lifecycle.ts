import type { Product } from "./tooku-data";

/**
 * Siklus Hidup Barang (Product Lifecycle) TOOKU.
 * Mitigasi penumpukan stok / dead-stock di gudang koperasi lewat 4 fase:
 * 1. Promosi otomatis (diskon bertingkat 30 hari 20%, 60 hari 50%)
 * 2. Optimalisasi penjualan (paket bundling barang lambat + barang utama)
 * 3. Penyaluran sosial (donasi otomatis setelah 90 hari tayang)
 * 4. Daur ulang kreatif (upcycling bahan praktik Prakarya)
 */

export const DAY_MS = 1000 * 60 * 60 * 24;

/** Ambang batas fase (hari tayang). */
export const MARKDOWN_1_DAY = 30;
export const MARKDOWN_2_DAY = 60;
export const DONATION_DAY = 90;

export type LifecycleStage = "aktif" | "cuci-gudang" | "obral-akhir" | "donasi" | "upcycle";

export const stageMeta: Record<
  LifecycleStage,
  { label: string; short: string; tone: string; desc: string }
> = {
  aktif: {
    label: "Tayang Normal",
    short: "Normal",
    tone: "bg-secondary text-secondary-foreground",
    desc: "Barang masih dalam masa tayang wajar (kurang dari 30 hari).",
  },
  "cuci-gudang": {
    label: "Cuci Gudang −20%",
    short: "Cuci Gudang",
    tone: "bg-accent text-accent-foreground",
    desc: "Lewat 30 hari tayang: harga otomatis dipotong 20% agar stok segera berputar.",
  },
  "obral-akhir": {
    label: "Obral Akhir −50%",
    short: "Obral −50%",
    tone: "bg-destructive text-destructive-foreground",
    desc: "Lewat 60 hari tayang: harga otomatis dipotong 50% sebagai upaya terakhir penjualan.",
  },
  donasi: {
    label: "Siap Donasi",
    short: "Donasi",
    tone: "bg-primary text-primary-foreground",
    desc: "Lewat 90 hari tayang: kepemilikan diikhlaskan penitip, koperasi menyalurkan sebagai donasi sosial.",
  },
  upcycle: {
    label: "Daur Ulang Kreatif",
    short: "Upcycle",
    tone: "bg-muted text-muted-foreground",
    desc: "Tidak layak jual/donasi: kain disalurkan ke guru Prakarya sebagai bahan praktik siswa.",
  },
};

export const daysListed = (p: Product, now = Date.now()) =>
  Math.max(0, Math.floor((now - (p.listedAt ?? now)) / DAY_MS));

/** Persen diskon otomatis berdasarkan lama tayang. */
export const autoDiscount = (days: number) =>
  days >= MARKDOWN_2_DAY ? 50 : days >= MARKDOWN_1_DAY ? 20 : 0;

/** Fase siklus hidup sebuah barang (manual override menang atas hitungan hari). */
export const stageOf = (p: Product, now = Date.now()): LifecycleStage => {
  if (p.lifecycle === "donasi" || p.lifecycle === "upcycle") return p.lifecycle;
  const d = daysListed(p, now);
  if (d >= DONATION_DAY) return "donasi";
  if (d >= MARKDOWN_2_DAY) return "obral-akhir";
  if (d >= MARKDOWN_1_DAY) return "cuci-gudang";
  return "aktif";
};

/** Barang yang masih boleh dibeli pembeli (belum masuk donasi/upcycle). */
export const isSellable = (p: Product, now = Date.now()) => {
  const s = stageOf(p, now);
  return s !== "donasi" && s !== "upcycle" && p.stock > 0;
};

export const isClearance = (p: Product, now = Date.now()) => {
  const s = stageOf(p, now);
  return s === "cuci-gudang" || s === "obral-akhir";
};

/** Harga setelah auto-markdown, dihitung dari harga dasar (basePrice). */
export const lifecyclePrice = (p: Product, now = Date.now()) => {
  const base = p.basePrice ?? p.price;
  const stage = stageOf(p, now);
  const discount = stage === "obral-akhir" ? 50 : stage === "cuci-gudang" ? 20 : 0;
  const price = Math.max(1000, Math.round((base * (100 - discount)) / 100 / 500) * 500);
  return { base, discount, price, stage, days: daysListed(p, now) };
};

/**
 * Terapkan auto-markdown ke seluruh katalog. Dipanggil saat aplikasi dimuat dan
 * setiap jam, sehingga harga di keranjang/checkout selalu memakai harga terbaru.
 */
export const applyLifecycle = (list: Product[], now = Date.now()): Product[] =>
  list.map((p) => {
    const listedAt = p.listedAt ?? now;
    const base = p.basePrice ?? p.price;
    const { price, stage } = lifecyclePrice({ ...p, listedAt, basePrice: base }, now);
    const next: Product = { ...p, listedAt, basePrice: base, price, lifecycleStage: stage };
    if (stage === "donasi" && p.lifecycle !== "upcycle" && p.lifecycle !== "donasi")
      next.lifecycle = "donasi";
    return next;
  });

export const bundleSuggestionPrice = (items: Product[]) => {
  const sum = items.reduce((s, p) => s + p.price, 0);
  return Math.max(1000, Math.round((sum * 0.8) / 500) * 500);
};
