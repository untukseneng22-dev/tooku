import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  Ticket,
  QrCode,
  Building2,
  Wallet,
  Store,
  Info,
  Truck,
  PackageCheck,
  MapPin,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTooku, type Order, type PaymentMethod, type Fulfillment } from "@/lib/tooku-store";
import { rupiah, schoolById, schools } from "@/lib/tooku-data";
import {
  allowedPayments,
  commonCouriers,
  deliveryAvailable,
  shippingQuote,
  zoneEta,
  zoneLabel,
  type Courier,
} from "@/lib/tooku-shipping";
import { ProductThumb } from "@/components/tooku/ui";

export const Route = createFileRoute("/keranjang")({
  head: () => ({
    meta: [
      { title: "Keranjang & Checkout — TOOKU" },
      {
        name: "description",
        content:
          "Kelola item keranjang, pilih ambil di koperasi atau kirim via ekspedisi, lalu bayar online, tunai di koperasi, atau COD.",
      },
      { property: "og:title", content: "Keranjang & Checkout — TOOKU" },
      {
        property: "og:description",
        content: "Checkout multi-item barang koperasi sekolah: ambil sendiri atau dikirim lintas sekolah.",
      },
    ],
  }),
  component: CartPage,
});

const onlineChannels = [
  { id: "QRIS", label: "QRIS", desc: "Scan dari semua e-wallet & mobile banking", icon: QrCode },
  { id: "Virtual Account", label: "Transfer Virtual Account", desc: "BCA, BRI, Mandiri, BNI", icon: Building2 },
  { id: "E-Wallet", label: "E-Wallet", desc: "GoPay, OVO, DANA, ShopeePay", icon: Wallet },
];

const districts = [...new Set(schools.map((s) => s.district))].sort();

function CartPage() {
  const { cart, products, setQty, removeFromCart, checkout, user, shippingConfigs } = useTooku();
  const navigate = useNavigate();
  const [fulfillment, setFulfillment] = useState<Fulfillment>("pickup");
  const [method, setMethod] = useState<PaymentMethod>("koperasi");
  const [channel, setChannel] = useState("QRIS");
  const [done, setDone] = useState<Order | null>(null);
  const [form, setForm] = useState({
    recipient: user?.name ?? "",
    phone: "",
    address: "",
    district: districts[0] ?? "Magetan",
    city: "Kabupaten Magetan",
    province: "Jawa Timur",
    note: "",
  });
  const [courier, setCourier] = useState<Courier>("J&T Express");
  const [error, setError] = useState<string | null>(null);

  const lines = cart
    .map((l) => ({ line: l, product: products.find((p) => p.id === l.productId)! }))
    .filter((x) => x.product);
  const subtotal = lines.reduce((s, x) => s + x.product.price * x.line.qty, 0);
  const schoolIds = lines.map((x) => x.product.schoolId).filter(Boolean) as string[];
  const uniqueSchools = [...new Set(schoolIds)];

  const canDeliver = deliveryAvailable(shippingConfigs, schoolIds);
  const payOptions = allowedPayments(shippingConfigs, schoolIds);
  const courierOptions = commonCouriers(shippingConfigs, schoolIds);
  const quote = useMemo(
    () =>
      shippingQuote(shippingConfigs, schoolIds, {
        district: form.district,
        city: form.city,
        province: form.province,
      }),
    [shippingConfigs, schoolIds.join(","), form.district, form.city, form.province],
  );

  const isDelivery = fulfillment === "delivery" && canDeliver;
  const shippingTotal = isDelivery ? quote.total : 0;
  const fee = method === "online" ? 2500 : 0;

  // Metode yang boleh dipakai pada mode fulfillment terpilih.
  const methodsForMode: PaymentMethod[] = isDelivery
    ? (["online", "cod"] as PaymentMethod[]).filter((m) => payOptions.includes(m))
    : (["koperasi", "online"] as PaymentMethod[]).filter((m) => payOptions.includes(m));
  const effectiveMethod: PaymentMethod = methodsForMode.includes(method)
    ? method
    : (methodsForMode[0] ?? "koperasi");

  function submit() {
    setError(null);
    if (isDelivery) {
      if (!form.recipient.trim() || !form.phone.trim() || !form.address.trim()) {
        setError("Lengkapi nama penerima, nomor HP, dan alamat lengkap terlebih dahulu.");
        return;
      }
    }
    const order = checkout({
      fulfillment: isDelivery ? "delivery" : "pickup",
      paymentMethod: effectiveMethod,
      ...(effectiveMethod === "online" ? { paymentChannel: channel } : {}),
      ...(isDelivery
        ? {
            shipping: {
              recipient: form.recipient.trim(),
              phone: form.phone.trim(),
              address: form.address.trim(),
              district: form.district,
              city: form.city,
              province: form.province,
              ...(form.note.trim() ? { note: form.note.trim() } : {}),
              courier: courierOptions.includes(courier) ? courier : (courierOptions[0] ?? courier),
            },
          }
        : {}),
    });
    if (order) setDone(order);
    else setError("Checkout gagal. Pastikan keranjang tidak kosong dan data pengiriman lengkap.");
  }

  if (done) {
    const delivered = done.fulfillment === "delivery";
    return (
      <div className="mx-auto max-w-md px-4 py-12 pb-32 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent/20">
          {delivered ? (
            <Truck className="h-8 w-8 text-accent-foreground" />
          ) : (
            <Ticket className="h-8 w-8 text-accent-foreground" />
          )}
        </div>
        <h1 className="mt-4 text-xl font-bold">Pesanan Berhasil Dibuat!</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {delivered
            ? "Koperasi akan mengemas dan menyerahkan paket ke kurir."
            : "Tunjukkan kode ini di Koperasi Sekolah."}
        </p>
        <div className="mt-5 rounded-3xl bg-primary p-6 text-primary-foreground">
          <p className="text-xs opacity-80">{delivered ? "Kode Pesanan" : "Kode Pengambilan"}</p>
          <p className="mt-1 text-3xl font-extrabold tracking-widest">{done.code}</p>
          <p className="mt-3 text-xs opacity-80">
            {delivered
              ? "Koperasi memproses maksimal 2x24 jam sejak pesanan dibuat"
              : "Berlaku 1x24 jam sejak pemesanan"}
          </p>
        </div>
        <div className="mt-4 space-y-1 text-sm">
          <p>
            Total: <strong>{rupiah(done.total)}</strong>
          </p>
          <p className="text-xs text-muted-foreground">
            {done.paymentMethod === "online"
              ? `Bayar Online (${done.paymentChannel})`
              : done.paymentMethod === "cod"
                ? "COD — bayar saat paket diterima"
                : "Bayar tunai di koperasi"}
            {delivered && done.shipping ? ` · ${done.shipping.courier}` : ""}
          </p>
        </div>
        {done.paymentMethod === "online" && (
          <div className="mt-4 flex gap-2 rounded-2xl border border-accent/40 bg-accent/10 p-3 text-left">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent-foreground" />
            <p className="text-xs">
              Status pembayaran: <strong>Menunggu Konfirmasi</strong>. Instruksi pembayaran otomatis belum aktif karena
              layanan pembayaran (payment gateway) belum dikonfigurasi — admin koperasi akan mengonfirmasi pembayaran
              secara manual.
            </p>
          </div>
        )}
        <button
          onClick={() => navigate({ to: "/pesanan" })}
          className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground"
        >
          Lihat Status Pesanan
        </button>
        <Link to="/" className="mt-3 block text-sm font-semibold text-primary">
          Lanjut belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-44">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
        <Link to="/" aria-label="Kembali">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-sm font-semibold">Keranjang & Checkout</h1>
      </header>

      <div className="mx-auto max-w-2xl space-y-4 p-4">
        {lines.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground">Keranjang masih kosong.</p>
            <Link to="/" className="mt-3 inline-block font-semibold text-primary">
              Cari barang terkurasi
            </Link>
          </div>
        ) : (
          <>
            {lines.map(({ line, product }) => (
              <div key={product.id} className="flex gap-3 rounded-2xl border border-border bg-card p-3">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                  <ProductThumb product={product} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-xs leading-snug">{product.name}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {schoolById(product.schoolId ?? "")?.koperasi ?? product.seller}
                  </p>
                  <p className="mt-1 text-sm font-bold text-primary">{rupiah(product.price)}</p>
                  <p className="text-[10px] text-muted-foreground">Sisa stok: {product.stock}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      onClick={() => setQty(product.id, line.qty - 1)}
                      className="grid h-7 w-7 place-items-center rounded-lg border border-border"
                      aria-label="Kurangi"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-sm font-semibold">{line.qty}</span>
                    <button
                      onClick={() => setQty(product.id, Math.min(product.stock, line.qty + 1))}
                      disabled={line.qty >= product.stock}
                      className="grid h-7 w-7 place-items-center rounded-lg border border-border disabled:opacity-40"
                      aria-label="Tambah"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="ml-auto text-muted-foreground"
                      aria-label="Hapus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* ==== Cara Terima Barang ==== */}
            <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
              <h2 className="text-sm font-bold">Cara Terima Barang</h2>
              {uniqueSchools.length > 1 && (
                <p className="flex gap-2 rounded-xl bg-secondary/60 p-2.5 text-[11px] text-muted-foreground">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Keranjang berisi barang dari {uniqueSchools.length} koperasi sekolah. Ongkir dihitung per koperasi
                  karena paket dikirim terpisah.
                </p>
              )}

              <button
                onClick={() => {
                  setFulfillment("pickup");
                  setMethod("koperasi");
                }}
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left ${
                  fulfillment === "pickup" ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  <span className="block text-xs font-bold">Ambil Sendiri di Koperasi Sekolah</span>
                  <span className="block text-[11px] text-muted-foreground">
                    Gratis ongkir · tunjukkan kode pengambilan pada jam layanan koperasi (batas 1x24 jam)
                  </span>
                </span>
              </button>

              <button
                onClick={() => {
                  if (!canDeliver) return;
                  setFulfillment("delivery");
                  setMethod(payOptions.includes("online") ? "online" : "cod");
                }}
                disabled={!canDeliver}
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left disabled:opacity-50 ${
                  isDelivery ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  <span className="block text-xs font-bold">Kirim via Ekspedisi ke Alamat Saya</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {canDeliver
                      ? "Untuk pembeli dari sekolah/kecamatan lain — dikemas koperasi, diantar kurir"
                      : "Belum tersedia: salah satu koperasi pada keranjang ini belum melayani pengiriman"}
                  </span>
                </span>
              </button>
            </section>

            {/* ==== Alamat & Kurir ==== */}
            {isDelivery && (
              <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
                <h2 className="flex items-center gap-2 text-sm font-bold">
                  <MapPin className="h-4 w-4 text-primary" /> Alamat Pengiriman
                </h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Field
                    label="Nama Penerima"
                    value={form.recipient}
                    onChange={(v) => setForm((f) => ({ ...f, recipient: v }))}
                    placeholder="Nama lengkap"
                  />
                  <Field
                    label="Nomor HP / WhatsApp"
                    value={form.phone}
                    onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                    placeholder="08xx xxxx xxxx"
                  />
                </div>
                <label className="block text-[11px] font-semibold text-muted-foreground">
                  Alamat Lengkap
                  <textarea
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    rows={2}
                    placeholder="Jalan, nomor rumah, RT/RW, desa"
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-xs font-normal text-foreground"
                  />
                </label>
                <div className="grid gap-2 sm:grid-cols-3">
                  <label className="block text-[11px] font-semibold text-muted-foreground">
                    Kecamatan
                    <select
                      value={form.district}
                      onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-xs font-normal text-foreground"
                    >
                      {districts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </label>
                  <Field
                    label="Kabupaten/Kota"
                    value={form.city}
                    onChange={(v) => setForm((f) => ({ ...f, city: v }))}
                    placeholder="Kabupaten Magetan"
                  />
                  <Field
                    label="Provinsi"
                    value={form.province}
                    onChange={(v) => setForm((f) => ({ ...f, province: v }))}
                    placeholder="Jawa Timur"
                  />
                </div>
                <Field
                  label="Catatan untuk Koperasi (opsional)"
                  value={form.note}
                  onChange={(v) => setForm((f) => ({ ...f, note: v }))}
                  placeholder="Patokan rumah, jam terima paket, dll."
                />

                <div className="space-y-2 rounded-xl bg-secondary/60 p-3">
                  <p className="text-[11px] font-bold">Pilih Kurir</p>
                  {courierOptions.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground">
                      Tidak ada kurir yang dilayani semua koperasi di keranjang ini. Pisahkan pesanan per koperasi.
                    </p>
                  ) : (
                    courierOptions.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCourier(c)}
                        className={`flex w-full items-center gap-3 rounded-xl border bg-card p-2.5 text-left ${
                          courier === c ? "border-primary" : "border-border"
                        }`}
                      >
                        <Truck className="h-4 w-4 shrink-0 text-primary" />
                        <span className="min-w-0">
                          <span className="block text-xs font-semibold">{c}</span>
                          <span className="block text-[10px] text-muted-foreground">
                            Estimasi {zoneEta[quote.lines[0]?.zone ?? "kabupaten"]}
                          </span>
                        </span>
                      </button>
                    ))
                  )}
                </div>

                <div className="space-y-1 rounded-xl border border-border p-3 text-[11px]">
                  <p className="font-bold">Rincian Ongkir</p>
                  {quote.lines.map((l) => (
                    <div key={l.schoolId} className="flex justify-between gap-2">
                      <span className="min-w-0 truncate text-muted-foreground">
                        {l.koperasi} · {zoneLabel[l.zone]}
                      </span>
                      <span className="shrink-0 font-semibold">{rupiah(l.fee)}</span>
                    </div>
                  ))}
                  {quote.extraFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Biaya paket terpisah antar koperasi</span>
                      <span className="font-semibold">{rupiah(quote.extraFee)}</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ==== Pembayaran ==== */}
            <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
              <h2 className="text-sm font-bold">Metode Pembayaran</h2>

              {methodsForMode.includes("koperasi") && (
                <PayCard
                  active={effectiveMethod === "koperasi"}
                  onClick={() => setMethod("koperasi")}
                  icon={Store}
                  title="Bayar di Koperasi saat Pengambilan"
                  desc="Tunai, tanpa biaya layanan"
                />
              )}
              {methodsForMode.includes("online") && (
                <PayCard
                  active={effectiveMethod === "online"}
                  onClick={() => setMethod("online")}
                  icon={Wallet}
                  title="Pembayaran Online"
                  desc={`QRIS, Virtual Account, E-Wallet · biaya layanan ${rupiah(2500)}`}
                />
              )}
              {methodsForMode.includes("cod") && (
                <PayCard
                  active={effectiveMethod === "cod"}
                  onClick={() => setMethod("cod")}
                  icon={Truck}
                  title="COD — Bayar saat Paket Diterima"
                  desc="Bayar tunai ke kurir; hanya untuk pesanan yang dikirim"
                />
              )}

              {effectiveMethod === "online" && (
                <div className="space-y-2 rounded-xl bg-secondary/60 p-3">
                  {onlineChannels.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setChannel(c.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border bg-card p-2.5 text-left ${
                        channel === c.id ? "border-primary" : "border-border"
                      }`}
                    >
                      <c.icon className="h-4 w-4 shrink-0 text-primary" />
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-semibold">{c.label}</span>
                        <span className="block truncate text-[10px] text-muted-foreground">{c.desc}</span>
                      </span>
                    </button>
                  ))}
                  <p className="flex gap-2 text-[11px] text-muted-foreground">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    Layanan pembayaran belum dikonfigurasi, jadi pesanan online dibuat dengan status “Menunggu
                    Konfirmasi” dan tidak ditandai lunas otomatis.
                  </p>
                </div>
              )}
            </section>

            <section className="space-y-1.5 rounded-2xl border border-border bg-card p-4 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({lines.length} item)</span>
                <span className="font-semibold">{rupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ongkir</span>
                <span className="font-semibold">{isDelivery ? rupiah(shippingTotal) : "Gratis (ambil sendiri)"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Biaya layanan</span>
                <span className="font-semibold">{rupiah(fee)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-sm">
                <span className="font-bold">Total</span>
                <span className="font-extrabold text-primary">{rupiah(subtotal + shippingTotal + fee)}</span>
              </div>
              <p className="pt-1 text-[11px] text-muted-foreground">
                Stok direservasi setelah checkout dan dikembalikan otomatis bila pesanan dibatalkan.
              </p>
            </section>

            {error && (
              <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                {error}
              </p>
            )}
          </>
        )}
      </div>

      {lines.length > 0 && (
        <div className="fixed inset-x-0 bottom-[68px] z-40 border-t border-border bg-card p-3">
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Total</p>
              <p className="truncate text-base font-extrabold text-primary">
                {rupiah(subtotal + shippingTotal + fee)}
              </p>
            </div>
            {user ? (
              <button
                onClick={submit}
                className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground"
              >
                {isDelivery ? "Checkout & Kirim" : "Checkout & Buat Kode"}
              </button>
            ) : (
              <Link
                to="/auth"
                className="flex-1 rounded-xl bg-primary py-3 text-center text-sm font-bold text-primary-foreground"
              >
                Masuk untuk Checkout
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block text-[11px] font-semibold text-muted-foreground">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-xs font-normal text-foreground"
      />
    </label>
  );
}

function PayCard({
  active,
  onClick,
  icon: Icon,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Store;
  title: string;
  desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left ${
        active ? "border-primary bg-primary/5" : "border-border"
      }`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <span>
        <span className="block text-xs font-bold">{title}</span>
        <span className="block text-[11px] text-muted-foreground">{desc}</span>
      </span>
    </button>
  );
}
