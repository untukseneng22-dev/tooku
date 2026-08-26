import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck, MapPin, Clock, Check, X, Store, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useBaraka } from "@/lib/baraka-store";
import { rupiah } from "@/lib/baraka-data";
import { ProductThumb, CuratedBadge, ProductCard } from "@/components/baraka/ui";

export const Route = createFileRoute("/produk/$id")({
  head: () => ({
    meta: [
      { title: "Detail Barang — TOOKU Koperasi Sekolah" },
      {
        name: "description",
        content:
          "Lihat kondisi, harga, dan informasi pengambilan barang sekolah bekas layak pakai yang sudah lolos kurasi koperasi.",
      },
      { property: "og:title", content: "Detail Barang — TOOKU Koperasi Sekolah" },
      {
        property: "og:description",
        content: "Barang sekolah bekas terkurasi koperasi: kondisi transparan, harga hemat, ambil di koperasi.",
      },
    ],
  }),
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const { products, addToCart } = useBaraka();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === id);
  const [active, setActive] = useState(0);

  if (!product) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Barang tidak ditemukan.</p>
        <Link to="/" className="mt-4 inline-block font-semibold text-primary">
          Kembali ke beranda
        </Link>
      </div>
    );
  }

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-background pb-40">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
        <button onClick={() => navigate({ to: "/" })} aria-label="Kembali" className="text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="truncate text-sm font-semibold">Detail Barang</h1>
      </header>

      <div className="mx-auto max-w-2xl">
        <div className="aspect-square w-full overflow-hidden bg-muted">
          <ProductThumb product={product} />
        </div>
        <div className="flex gap-2 px-4 py-3">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-16 w-16 overflow-hidden rounded-xl border-2 ${
                active === i ? "border-accent" : "border-border"
              }`}
            >
              <ProductThumb product={product} />
            </button>
          ))}
        </div>

        <section className="space-y-3 border-b border-border px-4 pb-5">
          {product.curated && <CuratedBadge />}
          <h2 className="text-lg font-bold leading-snug">{product.name}</h2>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-extrabold text-primary">{rupiah(product.price)}</p>
            {product.originalPrice && (
              <p className="pb-1 text-sm text-muted-foreground line-through">{rupiah(product.originalPrice)}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-secondary px-2.5 py-1 font-medium">{product.category}</span>
            <span className="rounded-full bg-secondary px-2.5 py-1 font-medium">Kondisi: {product.condition}</span>
            <span className="rounded-full bg-secondary px-2.5 py-1 font-medium">Stok: {product.stock}</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <Store className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold">{product.seller}</p>
              <p className="text-[11px] text-muted-foreground">Penjual terverifikasi koperasi</p>
            </div>
            <Link
              to="/chat"
              search={{ penjual: product.seller, produk: product.name }}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-primary px-3 py-1.5 text-[11px] font-bold text-primary"
            >
              <MessageCircle className="h-3.5 w-3.5" /> Chat
            </Link>
          </div>
        </section>

        <section className="space-y-4 border-b border-border px-4 py-5">
          <h3 className="text-sm font-bold">Kondisi Transparan</h3>
          <div className="space-y-2 rounded-2xl bg-secondary/60 p-3">
            {product.plus.map((t) => (
              <p key={t} className="flex gap-2 text-xs">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {t}
              </p>
            ))}
            {product.minus.map((t) => (
              <p key={t} className="flex gap-2 text-xs">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" /> {t}
              </p>
            ))}
          </div>
          <div className="flex gap-2 rounded-2xl border border-accent/40 bg-accent/10 p-3">
            <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent-foreground" />
            <p className="text-xs">
              Barang sudah <strong>diperiksa, dibersihkan, dan diverifikasi</strong> oleh tim kurasi Koperasi Sekolah
              sebelum dijual.
            </p>
          </div>
        </section>

        <section className="space-y-2 border-b border-border px-4 py-5">
          <h3 className="text-sm font-bold">Informasi Pengambilan</h3>
          <p className="flex gap-2 text-xs text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> Koperasi Sekolah — Gedung B lantai 1, samping ruang OSIS
          </p>
          <p className="flex gap-2 text-xs text-muted-foreground">
            <Clock className="mt-0.5 h-4 w-4 shrink-0" /> Senin–Jumat, 07.00–15.00. Bayar tunai saat pengambilan.
          </p>
          <p className="text-xs text-muted-foreground">
            Setelah memesan kamu mendapat <strong>kode pengambilan</strong> yang berlaku <strong>1x24 jam</strong>.
          </p>
        </section>

        {related.length > 0 && (
          <section className="px-4 py-5">
            <h3 className="mb-3 text-sm font-bold">Barang Serupa</h3>
            <div className="grid grid-cols-2 gap-3">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-[68px] z-40 border-t border-border bg-card p-3">
        <div className="mx-auto flex max-w-2xl gap-2">
          <Link
            to="/chat"
            search={{ penjual: product.seller, produk: product.name }}
            aria-label="Chat penjual"
            className="grid shrink-0 place-items-center rounded-xl border border-primary px-3 text-primary"
          >
            <MessageCircle className="h-5 w-5" />
          </Link>
          <button
            onClick={() => addToCart(product.id)}
            disabled={product.stock === 0}
            className="rounded-xl border border-primary px-4 py-3 text-sm font-semibold text-primary disabled:opacity-40"
          >
            + Keranjang
          </button>
          <button
            onClick={() => {
              addToCart(product.id);
              navigate({ to: "/keranjang" });
            }}
            disabled={product.stock === 0}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-40"
          >
            {product.stock === 0 ? "Stok Habis" : "Pesan Sekarang"}
          </button>
        </div>
      </div>
    </div>
  );
}
