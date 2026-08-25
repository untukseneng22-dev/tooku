import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Minus, Plus, Trash2, Ticket } from "lucide-react";
import { useState } from "react";
import { useBaraka, type Order } from "@/lib/baraka-store";
import { rupiah } from "@/lib/baraka-data";
import { ProductThumb } from "@/components/baraka/ui";

export const Route = createFileRoute("/keranjang")({
  head: () => ({
    meta: [
      { title: "Keranjang & Booking — BARAKA" },
      {
        name: "description",
        content: "Selesaikan booking barang koperasi dan dapatkan kode pengambilan berlaku 1x24 jam.",
      },
      { property: "og:title", content: "Keranjang & Booking — BARAKA" },
      { property: "og:description", content: "Booking barang sekolah bekas dan ambil di koperasi dalam 1x24 jam." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { cart, products, setQty, removeFromCart, checkout } = useBaraka();
  const navigate = useNavigate();
  const [name, setName] = useState("Siti Aisyah — X IPA 1");
  const [done, setDone] = useState<Order | null>(null);

  const lines = cart
    .map((l) => ({ line: l, product: products.find((p) => p.id === l.productId)! }))
    .filter((x) => x.product);
  const total = lines.reduce((s, x) => s + x.product.price * x.line.qty, 0);

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
          Total tagihan: <strong>{rupiah(done.total)}</strong> (bayar tunai saat pengambilan)
        </p>
        <button
          onClick={() => navigate({ to: "/pesanan" })}
          className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground"
        >
          Lihat Pesanan Saya
        </button>
        <Link to="/" className="mt-3 block text-sm font-semibold text-primary">
          Lanjut belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-40">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
        <Link to="/" aria-label="Kembali">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-sm font-semibold">Keranjang & Booking</h1>
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
                      className="grid h-7 w-7 place-items-center rounded-lg border border-border"
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

            <div className="space-y-2 rounded-2xl border border-border bg-card p-4">
              <label className="text-xs font-semibold" htmlFor="nama">
                Nama & Kelas Pemesan
              </label>
              <input
                id="nama"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Booking menghasilkan kode pengambilan. Ambil & bayar di koperasi maksimal 1x24 jam, lewat batas waktu
                pesanan otomatis kedaluwarsa.
              </p>
            </div>
          </>
        )}
      </div>

      {lines.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card p-3">
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Total</p>
              <p className="truncate text-base font-extrabold text-primary">{rupiah(total)}</p>
            </div>
            <button
              onClick={() => setDone(checkout(name))}
              className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground"
            >
              Buat Kode Pengambilan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
