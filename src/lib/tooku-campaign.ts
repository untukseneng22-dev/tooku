/**
 * Event Kampanye TOOKU (tanggal cantik: 9.9, 10.10, 11.11, ...).
 * Admin Pusat membuat event, tiap koperasi mendaftarkan barangnya
 * beserta besar diskon yang mereka berikan selama event berjalan.
 */

export type Campaign = {
  id: string;
  /** Label pendek tanggal cantik, mis. "9.9". */
  badge: string;
  name: string;
  tagline: string;
  startsAt: number;
  endsAt: number;
  /** Batas diskon yang boleh dipilih koperasi peserta. */
  minDiscountPct: number;
  maxDiscountPct: number;
  createdAt: number;
};

export type CampaignJoin = {
  id: string;
  campaignId: string;
  schoolId: string;
  productIds: string[];
  discountPct: number;
  joinedAt: number;
};

export type CampaignPhase = "akan-datang" | "berjalan" | "berakhir";

export function campaignPhase(c: Campaign, now = Date.now()): CampaignPhase {
  if (now < c.startsAt) return "akan-datang";
  if (now > c.endsAt) return "berakhir";
  return "berjalan";
}

export const phaseLabel: Record<CampaignPhase, string> = {
  "akan-datang": "Akan Datang",
  berjalan: "Sedang Berjalan",
  berakhir: "Sudah Berakhir",
};

/** Daftar tanggal cantik berikutnya untuk pilihan cepat Admin Pusat. */
export function upcomingPrettyDates(from = Date.now(), count = 6) {
  const out: { badge: string; date: Date }[] = [];
  const start = new Date(from);
  let year = start.getFullYear();
  let month = start.getMonth(); // 0-indexed
  for (let i = 0; out.length < count && i < 24; i++) {
    const m = month + i;
    const y = year + Math.floor(m / 12);
    const mm = (m % 12) + 1; // 1-12
    const d = new Date(y, mm - 1, mm, 0, 0, 0, 0);
    if (d.getTime() > from) out.push({ badge: `${mm}.${mm}`, date: d });
  }
  year = 0;
  return out;
}

/** Diskon event yang berlaku untuk sebuah barang saat ini. */
export function campaignDiscountFor(
  campaigns: Campaign[],
  joins: CampaignJoin[],
  productId: string,
  now = Date.now(),
): { campaign: Campaign; discountPct: number } | null {
  let best: { campaign: Campaign; discountPct: number } | null = null;
  for (const j of joins) {
    if (!j.productIds.includes(productId)) continue;
    const c = campaigns.find((x) => x.id === j.campaignId);
    if (!c || campaignPhase(c, now) !== "berjalan") continue;
    if (!best || j.discountPct > best.discountPct) best = { campaign: c, discountPct: j.discountPct };
  }
  return best;
}

/** Harga setelah diskon event, dibulatkan ke Rp500 terdekat. */
export function campaignPrice(price: number, discountPct: number): number {
  const pct = Math.min(90, Math.max(0, discountPct));
  if (pct === 0) return price;
  return Math.max(1000, Math.round((price * (1 - pct / 100)) / 500) * 500);
}

/** Event contoh: tanggal cantik terdekat, berlangsung 1 hari. */
export function seedCampaigns(): Campaign[] {
  const next = upcomingPrettyDates(Date.now(), 1)[0];
  if (!next) return [];
  const starts = next.date.getTime();
  return [
    {
      id: "cp-seed-" + next.badge,
      badge: next.badge,
      name: `Event ${next.badge} Serba Hemat Koperasi`,
      tagline: "Diskon spesial tanggal cantik dari koperasi sekolah se-Magetan",
      startsAt: starts,
      endsAt: starts + 1000 * 60 * 60 * 24,
      minDiscountPct: 10,
      maxDiscountPct: 60,
      createdAt: Date.now(),
    },
  ];
}
