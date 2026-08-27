import { schoolById, schools } from "./tooku-data";

/** Ekspedisi yang dilayani koperasi sekolah (input resi manual oleh admin). */
export type Courier = "JNE" | "J&T Express" | "POS Indonesia";
export const couriers: Courier[] = ["JNE", "J&T Express", "POS Indonesia"];

/** Metode pembayaran yang boleh diizinkan tiap koperasi. */
export type PayOption = "online" | "koperasi" | "cod";
export const payOptionLabel: Record<PayOption, string> = {
  online: "Bayar Online (QRIS/VA/E-Wallet)",
  koperasi: "Bayar Tunai di Koperasi",
  cod: "COD — bayar saat paket diterima",
};

export type ShipZone = "kecamatan" | "kabupaten" | "provinsi" | "luar";
export const zones: ShipZone[] = ["kecamatan", "kabupaten", "provinsi", "luar"];

export const zoneLabel: Record<ShipZone, string> = {
  kecamatan: "Satu kecamatan dengan koperasi",
  kabupaten: "Dalam Kabupaten Magetan",
  provinsi: "Luar kabupaten, dalam Jawa Timur",
  luar: "Luar Jawa Timur",
};

export const zoneEta: Record<ShipZone, string> = {
  kecamatan: "estimasi tiba 1 hari",
  kabupaten: "estimasi tiba 1–2 hari",
  provinsi: "estimasi tiba 2–3 hari",
  luar: "estimasi tiba 3–6 hari",
};

export type ShippingConfig = {
  /** Koperasi melayani pengiriman ekspedisi atau hanya ambil di tempat. */
  enabled: boolean;
  couriers: Courier[];
  /** Metode pembayaran yang diizinkan koperasi ini. */
  payments: PayOption[];
  /** Tarif flat per zona (rupiah). */
  rates: Record<ShipZone, number>;
};

export const defaultRates: Record<ShipZone, number> = {
  kecamatan: 6000,
  kabupaten: 10000,
  provinsi: 18000,
  luar: 30000,
};

export const defaultShippingConfig: ShippingConfig = {
  enabled: true,
  couriers: [...couriers],
  payments: ["online", "koperasi"],
  rates: { ...defaultRates },
};

/** Biaya tambahan bila satu checkout berisi barang dari lebih dari satu koperasi. */
export const MULTI_KOPERASI_FEE = 3000;

export type Destination = { district: string; city: string; province: string };

const norm = (s: string) => s.trim().toLowerCase();

export function zoneOf(schoolId: string, dest: Destination): ShipZone {
  const school = schoolById(schoolId);
  const city = norm(dest.city);
  const province = norm(dest.province);
  if (city.includes("magetan")) {
    if (school && norm(dest.district) === norm(school.district)) return "kecamatan";
    return "kabupaten";
  }
  if (!city) return province.includes("jawa timur") ? "provinsi" : "luar";
  return province.includes("jawa timur") ? "provinsi" : "luar";
}

export const configFor = (
  configs: Record<string, ShippingConfig>,
  schoolId: string,
): ShippingConfig => configs[schoolId] ?? defaultShippingConfig;

export const rateFor = (config: ShippingConfig, zone: ShipZone) =>
  config.rates[zone] ?? defaultRates[zone];

export type QuoteLine = { schoolId: string; koperasi: string; zone: ShipZone; fee: number };
export type Quote = { lines: QuoteLine[]; extraFee: number; total: number };

/** Estimasi ongkir per koperasi + biaya kiriman terpisah. */
export function shippingQuote(
  configs: Record<string, ShippingConfig>,
  schoolIds: string[],
  dest: Destination,
): Quote {
  const unique = [...new Set(schoolIds)];
  const lines: QuoteLine[] = unique.map((id) => {
    const zone = zoneOf(id, dest);
    const cfg = configFor(configs, id);
    return {
      schoolId: id,
      koperasi: schoolById(id)?.koperasi ?? "Koperasi Sekolah",
      zone,
      fee: rateFor(cfg, zone),
    };
  });
  const extraFee = Math.max(0, unique.length - 1) * MULTI_KOPERASI_FEE;
  return { lines, extraFee, total: lines.reduce((s, l) => s + l.fee, 0) + extraFee };
}

/** Metode pembayaran yang diizinkan oleh SEMUA koperasi dalam keranjang. */
export function allowedPayments(
  configs: Record<string, ShippingConfig>,
  schoolIds: string[],
): PayOption[] {
  const unique = [...new Set(schoolIds)];
  if (unique.length === 0) return ["online", "koperasi"];
  return (["online", "koperasi", "cod"] as PayOption[]).filter((p) =>
    unique.every((id) => configFor(configs, id).payments.includes(p)),
  );
}

/** Apakah semua koperasi dalam keranjang melayani pengiriman ekspedisi. */
export function deliveryAvailable(
  configs: Record<string, ShippingConfig>,
  schoolIds: string[],
): boolean {
  const unique = [...new Set(schoolIds)];
  return unique.length > 0 && unique.every((id) => configFor(configs, id).enabled);
}

/** Kurir yang dilayani semua koperasi dalam keranjang. */
export function commonCouriers(
  configs: Record<string, ShippingConfig>,
  schoolIds: string[],
): Courier[] {
  const unique = [...new Set(schoolIds)];
  if (unique.length === 0) return [...couriers];
  return couriers.filter((c) => unique.every((id) => configFor(configs, id).couriers.includes(c)));
}

export const seedShippingConfigs = (): Record<string, ShippingConfig> =>
  Object.fromEntries(
    schools.map((s, i) => [
      s.id,
      {
        ...defaultShippingConfig,
        rates: { ...defaultRates },
        couriers: [...couriers],
        // Sebagian koperasi mengizinkan COD, sebagian tidak — diatur admin masing-masing.
        payments: i % 3 === 0 ? ["online", "koperasi", "cod"] : ["online", "koperasi"],
      } satisfies ShippingConfig,
    ]),
  );
