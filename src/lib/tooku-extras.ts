/**
 * Fitur pelengkap marketplace TOOKU: ulasan produk, flash sale,
 * voucher promo, poin loyalitas, dan laporan barang.
 * Semua disimpan lewat store utama (persist localStorage).
 */

export type ProductReview = {
  id: string;
  productId: string;
  orderId: string;
  userId: string;
  author: string;
  rating: number; // 1–5
  text: string;
  createdAt: number;
};

export type FlashSale = {
  id: string;
  title: string;
  /** Id produk yang ikut flash sale. */
  productIds: string[];
  /** Potongan persen tambahan dari harga berjalan. */
  discountPct: number;
  /** Waktu berakhir (epoch ms). */
  endsAt: number;
  /** Koperasi pembuat (undefined = Admin Pusat / semua). */
  schoolId?: string;
  createdAt: number;
};

export type VoucherKind = "nominal" | "percent" | "ongkir";
export type Voucher = {
  code: string;
  kind: VoucherKind;
  /** nominal: rupiah; percent: 1–100; ongkir: nilai 1 (gratis ongkir). */
  value: number;
  minSpend: number;
  desc: string;
  active: boolean;
  expiresAt?: number;
};

export type PointsEntry = {
  id: string;
  userId: string;
  delta: number; // + dapat, - pakai
  reason: string;
  at: number;
};

export type ReportStatus = "baru" | "diproses" | "selesai";
export type ProductReport = {
  id: string;
  productId: string;
  productName: string;
  reporter: string;
  reason: string;
  at: number;
  status: ReportStatus;
};

/** 1 poin diberikan per kelipatan belanja ini. */
export const POINTS_PER_RUPIAH = 10000;
/** Nilai tukar 1 poin saat dipakai di checkout. */
export const POINT_VALUE = 1000;

export const pointsEarnedFor = (total: number) => Math.floor(total / POINTS_PER_RUPIAH);

export const DAY = 1000 * 60 * 60 * 24;

/** Voucher bawaan agar pembeli langsung bisa mencoba. */
export const seedVouchers: Voucher[] = [
  {
    code: "TOOKU10",
    kind: "percent",
    value: 10,
    minSpend: 25000,
    desc: "Diskon 10% (maks. Rp20.000) min. belanja Rp25.000",
    active: true,
  },
  {
    code: "HEMAT5K",
    kind: "nominal",
    value: 5000,
    minSpend: 15000,
    desc: "Potongan Rp5.000 min. belanja Rp15.000",
    active: true,
  },
  {
    code: "GRATISONGKIR",
    kind: "ongkir",
    value: 1,
    minSpend: 30000,
    desc: "Gratis ongkir untuk pengiriman min. belanja Rp30.000",
    active: true,
  },
];

/** Flash sale contoh: berakhir malam ini. */
export const seedFlashSales: FlashSale[] = [
  {
    id: "fs1",
    title: "Flash Sale Koperasi — Seragam & Buku",
    productIds: ["p1", "p3", "p5"],
    discountPct: 15,
    endsAt: Date.now() + 1000 * 60 * 60 * 9,
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
  },
];

/** Harga efektif setelah flash sale (dibulatkan ke Rp500 terdekat). */
export function flashPrice(
  price: number,
  sale: FlashSale | null | undefined,
): { price: number; discount: number } {
  if (!sale || sale.endsAt <= Date.now()) return { price, discount: 0 };
  const pct = Math.min(90, Math.max(1, sale.discountPct));
  const cut = Math.max(1000, Math.round((price * (1 - pct / 100)) / 500) * 500);
  return { price: cut, discount: pct };
}

export function activeFlashFor(flashSales: FlashSale[], productId: string): FlashSale | null {
  const now = Date.now();
  return flashSales.find((f) => f.endsAt > now && f.productIds.includes(productId)) ?? null;
}

/** Hitung potongan voucher terhadap subtotal/ongkir. */
export function voucherDiscount(
  voucher: Voucher,
  subtotal: number,
  shippingTotal: number,
): { ok: boolean; message?: string; cutSubtotal: number; cutShipping: number } {
  const now = Date.now();
  if (!voucher.active) return { ok: false, message: "Voucher sudah tidak aktif.", cutSubtotal: 0, cutShipping: 0 };
  if (voucher.expiresAt && voucher.expiresAt < now)
    return { ok: false, message: "Voucher sudah kedaluwarsa.", cutSubtotal: 0, cutShipping: 0 };
  if (subtotal < voucher.minSpend)
    return { ok: false, message: `Belanja minimal Rp${voucher.minSpend.toLocaleString("id-ID")}.`, cutSubtotal: 0, cutShipping: 0 };
  if (voucher.kind === "ongkir") {
    if (shippingTotal <= 0)
      return { ok: false, message: "Voucher ongkir hanya berlaku untuk pesanan kirim ekspedisi.", cutSubtotal: 0, cutShipping: 0 };
    return { ok: true, cutSubtotal: 0, cutShipping: shippingTotal };
  }
  if (voucher.kind === "percent") {
    const cut = Math.min(20000, Math.floor((subtotal * voucher.value) / 100));
    return { ok: true, cutSubtotal: cut, cutShipping: 0 };
  }
  return { ok: true, cutSubtotal: Math.min(voucher.value, subtotal), cutShipping: 0 };
}
