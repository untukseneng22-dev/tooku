import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Minus, Plus, Trash2, Ticket, QrCode, Building2, Wallet, Store, Info } from "lucide-react";
import { useState } from "react";
import { useBaraka, type Order, type PaymentMethod } from "@/lib/baraka-store";
import { rupiah } from "@/lib/baraka-data";
import { ProductThumb } from "@/components/baraka/ui";

export const Route = createFileRoute("/keranjang")({
  head: () => ({
    meta: [
      { title: "Keranjang & Checkout — BARAKA" },
      {
        name: "description",
        content:
          "Kelola item keranjang, pilih pembayaran online atau bayar di koperasi, dan dapatkan kode pengambilan 1x24 jam.",
      },
      { property: "og:title", content: "Keranjang & Checkout — BARAKA" },
      { property: "og:description", content: "Checkout multi-item barang koperasi sekolah dengan kode pengambilan." },
    ],
  }),
  component: CartPage,
});

const onlineChannels = [
  { id: "QRIS", label: "QRIS", desc: "Scan dari semua e-wallet & mobile banking", icon: QrCode },
  { id: "Virtual Account", label: "Transfer Virtual Account", desc: "BCA, BRI, Mandiri, BNI", icon: Building2 },
  { id: "E-Wallet", label: "E-Wallet", desc: "GoPay, OVO, DANA, ShopeePay", icon: Wallet },
];

function CartPage() {
  const { cart, products, setQty, removeFromCart, checkout, user } = useBaraka();
  const navigate = useNavigate();
  const [method, setMethod] = useState<PaymentMethod>("koperasi");
  const [channel, setChannel] = useState("QRIS");
  const [done, setDone] = useState<Order | null>(null);

  const lines = cart
    .map((l) => ({ line: l, product: products.find((p) => p.id === l.productId)! }))
    .filter((x) => x.product);
  const subtotal = lines.reduce((s, x) => s + x.product.price * x.line.qty, 0);
  const fee = method === "online" ? 2500 : 0;

  if (done) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 pb-32 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent/20">
          <Ticket className="h-8 w-8 text-accent-foreground" />
        </div>
        <h1 className="mt-4 text-xl font-bold">Booking Berhasil!</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tunjukkan kode ini di Koperasi Sekolah.</p>
        <div className="mt-5 rounded-3xl bg-primary p-6 text-primary-foreground">
          <p className="text-xs opacity-80">Kode Pengambilan</p>
          <p className="mt-1 text-3xl font-extrabold tracking-widest">{done.code}</p>
          <p className="mt-3 text-xs opacity-80">Berlaku 1x24 jam sejak pemesanan</p>
        </div>
        <p className="mt-4 text-sm">
          Total: <strong>{rupiah(done.total)}</strong> ·{" "}
          {done.paymentMethod === "online" ? `Online (${done.paymentChannel})` : "Bayar di Koperasi"}
        </p>
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

            <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
              <h2 className="text-sm font-bold">Metode Pembayaran</h2>
              <button
                onClick={() => setMethod("koperasi")}
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left ${
                  method === "koperasi" ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <Store className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  <span className="block text-xs font-bold">Bayar di Koperasi saat Pengambilan</span>
                  <span className="block text-[11px] text-muted-foreground">Tunai, tanpa biaya layanan</span>
                </span>
              </button>

              <button
                onClick={() => setMethod("online")}
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left ${
                  method === "online" ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  <span className="block text-xs font-bold">Pembayaran Online</span>
                  <span className="block text-[11px] text-muted-foreground">
                    QRIS, Virtual Account, E-Wallet · biaya layanan {rupiah(2500)}
                  </span>
                </span>
              </button>

              {method === "online" && (
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
                <span className="text-muted-foreground">Biaya layanan</span>
                <span className="font-semibold">{rupiah(fee)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-sm">
                <span className="font-bold">Total</span>
                <span className="font-extrabold text-primary">{rupiah(subtotal + fee)}</span>
              </div>
              <p className="pt-1 text-[11px] text-muted-foreground">
                Stok direservasi setelah checkout dan dikembalikan otomatis bila pesanan dibatalkan.
              </p>
            </section>
          </>
        )}
      </div>

      {lines.length > 0 && (
        <div className="fixed inset-x-0 bottom-[68px] z-40 border-t border-border bg-card p-3">
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Total</p>
              <p className="truncate text-base font-extrabold text-primary">{rupiah(subtotal + fee)}</p>
            </div>
            {user ? (
              <button
                onClick={() => {
                  const order = checkout(
                    method === "online" ? { paymentMethod: "online", paymentChannel: channel } : { paymentMethod: "koperasi" },
                  );
                  if (order) setDone(order);
                }}
                className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground"
              >
                Checkout & Buat Kode
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
